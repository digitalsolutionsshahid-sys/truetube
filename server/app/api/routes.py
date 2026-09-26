import asyncio
import json
import shutil
import threading
from typing import AsyncGenerator
import yt_dlp.version
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse

from app.config import settings
from app.core.security import (
    SecurityValidationError,
    SSRFBlockedError,
    validate_and_sanitize_url,
    sanitize_filename,
)
from app.models.schemas import (
    AnalyzeRequest,
    DownloadJobRequest,
    HealthResponse,
    JobStatusResponse,
    MediaInfoResponse,
)
from app.services.download_pipeline import download_pipeline
from app.services.job_manager import job_manager
from app.services.ytdlp_service import (
    InvalidMediaUrlError,
    MediaNetworkError,
    UnsupportedMediaSourceError,
    YtDlpExtractionError,
    ytdlp_service,
)

router = APIRouter(prefix="/api")

class ConcurrencyLimiter:
    """Thread-safe concurrency governor tracking active tasks and enforcing capacity limits."""
    def __init__(self, max_concurrent: int):
        self.semaphore = threading.Semaphore(max_concurrent)
        self._active_count = 0
        self._lock = threading.Lock()

    def acquire(self, timeout: float = 5.0) -> bool:
        acquired = self.semaphore.acquire(timeout=timeout)
        if acquired:
            with self._lock:
                self._active_count += 1
        return acquired

    def release(self):
        with self._lock:
            if self._active_count > 0:
                self._active_count -= 1
        self.semaphore.release()

    @property
    def active_count(self) -> int:
        with self._lock:
            return self._active_count

concurrency_limiter = ConcurrencyLimiter(settings.MAX_CONCURRENT_JOBS)

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Returns system status, yt-dlp version, and FFmpeg detection info."""
    ffmpeg_bin = settings.FFMPEG_PATH or shutil.which("ffmpeg") or ""
    active_count = len([j for j in job_manager._jobs.values() if j.status in ("QUEUED", "DOWNLOADING", "PROCESSING", "FINALIZING")])
    total_active = active_count + concurrency_limiter.active_count
    return HealthResponse(
        status="ok",
        ytdlp_version=getattr(yt_dlp.version, "__version__", "unknown"),
        ffmpeg_available=bool(ffmpeg_bin),
        ffmpeg_path=ffmpeg_bin,
        active_jobs=total_active,
        temp_dir=str(settings.TEMP_STORAGE_PATH),
    )

@router.post("/analyze", response_model=MediaInfoResponse)
def analyze_media(req: AnalyzeRequest):
    """
    Validates URL, prevents SSRF, and extracts real media metadata and available formats via yt-dlp.
    """
    try:
        clean_url = validate_and_sanitize_url(req.url)
    except SSRFBlockedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": str(e), "code": "UNSUPPORTED_SOURCE"},
        )
    except SecurityValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "INVALID_URL"},
        )

    if not concurrency_limiter.acquire(timeout=5.0):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Server is currently at maximum capacity. Please retry shortly.",
                "code": "NETWORK_ERROR",
            },
        )

    try:
        media_info = ytdlp_service.extract_info(clean_url)
        return media_info
    except InvalidMediaUrlError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": str(e), "code": "INVALID_URL"},
        )
    except UnsupportedMediaSourceError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"error": str(e), "code": "UNSUPPORTED_SOURCE"},
        )
    except MediaNetworkError as e:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={"error": str(e), "code": "NETWORK_ERROR"},
        )
    except YtDlpExtractionError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": e.code},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "TrueTube could not process this media. The source may be unavailable.",
                "code": "DOWNLOAD_FAILED",
            },
        )
    finally:
        concurrency_limiter.release()

# ------------------------------------------------------------------
# Download Pipeline Endpoints
# ------------------------------------------------------------------

@router.post("/jobs", response_model=JobStatusResponse, status_code=status.HTTP_201_CREATED)
def create_download_job(req: DownloadJobRequest):
    """
    Validates download parameters, creates a download job, and queues it for asynchronous processing.
    """
    try:
        clean_url = validate_and_sanitize_url(req.url)
        req.url = clean_url
    except SSRFBlockedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": str(e), "code": "UNSUPPORTED_SOURCE"},
        )
    except SecurityValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "INVALID_URL"},
        )

    # Check concurrency limit
    active_count = len([j for j in job_manager._jobs.values() if j.status in ("QUEUED", "DOWNLOADING", "PROCESSING", "FINALIZING")])
    if active_count >= settings.MAX_CONCURRENT_JOBS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": f"Server download limit reached ({settings.MAX_CONCURRENT_JOBS} active jobs). Please wait for ongoing downloads to finish.",
                "code": "DOWNLOAD_FAILED",
            },
        )

    # Create job and submit to background execution pipeline
    job = job_manager.create_job(req)
    download_pipeline.submit_job(job)

    return job.to_response()

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    """Get current snapshot status of a download job."""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Job {job_id} not found.", "code": "INVALID_URL"},
        )
    return job.to_response()

@router.get("/jobs/{job_id}/progress")
async def stream_job_progress(job_id: str):
    """
    Server-Sent Events (SSE) endpoint providing zero-latency live progress updates.
    """
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Job {job_id} not found.", "code": "INVALID_URL"},
        )

    async def event_generator() -> AsyncGenerator[str, None]:
        queue: asyncio.Queue = asyncio.Queue()
        job_manager.register_listener(job_id, queue)

        # Yield immediate initial state
        initial_job = job_manager.get_job(job_id)
        if initial_job:
            yield f"data: {json.dumps(initial_job.to_response().model_dump())}\n\n"
            if initial_job.status in ("COMPLETED", "FAILED", "CANCELLED"):
                job_manager.unregister_listener(job_id, queue)
                return

        try:
            while True:
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=2.0)
                    yield f"data: {json.dumps(data)}\n\n"

                    if data.get("status") in ("COMPLETED", "FAILED", "CANCELLED"):
                        break
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
                    current_job = job_manager.get_job(job_id)
                    if not current_job or current_job.status in ("COMPLETED", "FAILED", "CANCELLED"):
                        if current_job:
                            yield f"data: {json.dumps(current_job.to_response().model_dump())}\n\n"
                        break
        finally:
            job_manager.unregister_listener(job_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@router.post("/jobs/{job_id}/cancel")
def cancel_job(job_id: str):
    """Cancels an active download job, terminating worker and deleting temp artifacts."""
    success = job_manager.cancel_job(job_id)
    if not success:
        job = job_manager.get_job(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": f"Job {job_id} not found.", "code": "INVALID_URL"},
            )
        return {"success": False, "message": f"Job is already in status: {job.status}"}

    return {"success": True, "message": "Job cancelled successfully."}

@router.get("/jobs/{job_id}/file")
def download_completed_file(job_id: str):
    """
    Downloads the completed media file with proper Content-Disposition and sanitized filename.
    """
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Job {job_id} not found.", "code": "INVALID_URL"},
        )

    if job.status != "COMPLETED" or not job.file_path or not job.file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": f"File is not available for download (current status: {job.status}).",
                "code": "DOWNLOAD_FAILED",
            },
        )

    safe_name = sanitize_filename(job.filename or job.file_path.name)
    ext = job.file_path.suffix.lower()

    # Determine media mime type
    mime_types = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mkv": "video/x-matroska",
        ".avi": "video/x-msvideo",
        ".mp3": "audio/mpeg",
        ".m4a": "audio/mp4",
        ".wav": "audio/wav",
        ".opus": "audio/opus",
    }
    media_type = mime_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(job.file_path),
        media_type=media_type,
        filename=safe_name,
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}"',
        },
    )
