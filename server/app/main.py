import logging
import time
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as api_router
from app.config import settings
from app.services.download_pipeline import download_pipeline
from app.services.job_manager import job_manager

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("truetube")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup hook
    logger.info("Starting %s v%s", settings.APP_NAME, settings.VERSION)
    logger.info("FFmpeg configured: %s", settings.FFMPEG_PATH or "NOT FOUND")
    logger.info("Temp storage initialized at: %s", settings.TEMP_STORAGE_PATH)
    yield
    # Shutdown hook
    logger.info("Shutting down %s...", settings.APP_NAME)
    download_pipeline.executor.shutdown(wait=False, cancel_futures=True)
    # Purge any remaining temp files on clean shutdown
    job_manager.clean_expired_jobs(ttl=0)
    logger.info("Shutdown completed.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="High-performance media downloading and processing engine powered by yt-dlp and FFmpeg.",
    lifespan=lifespan,
)

# Enable CORS for development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP Request Logging & Timing Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000.0

    # Avoid cluttering logs with static asset queries
    if not request.url.path.startswith("/assets/"):
        logger.info(
            "%s %s -> %s (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
    return response

# Register API routes
app.include_router(api_router)

# Production client static serving
CLIENT_DIST = Path(__file__).resolve().parent.parent.parent / "client" / "dist"
if CLIENT_DIST.exists() and (CLIENT_DIST / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(CLIENT_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        requested_file = CLIENT_DIST / full_path
        if requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(CLIENT_DIST / "index.html")
else:
    @app.get("/")
    def index():
        return {
            "name": settings.APP_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs": "/docs",
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
