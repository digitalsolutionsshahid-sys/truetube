import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.routes import router as api_router
from app.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="High-performance media downloading and processing engine powered by yt-dlp and FFmpeg.",
)

# Enable CORS for development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)

# Production client static serving
CLIENT_DIST = Path(__file__).resolve().parent.parent.parent / "client" / "dist"
if CLIENT_DIST.exists() and (CLIENT_DIST / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(CLIENT_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Serve static file if exists, else return index.html
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
