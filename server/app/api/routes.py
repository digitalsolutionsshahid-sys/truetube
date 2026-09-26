import shutil
import threading
import yt_dlp.version
from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.core.security import (
    SecurityValidationError,
    SSRFBlockedError,
    validate_and_sanitize_url,
)
from app.models.schemas import AnalyzeRequest, HealthResponse, MediaInfoResponse
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
    """Returns system status, yt-dlp version, active jobs, and FFmpeg detection info."""
    ffmpeg_bin = settings.FFMPEG_PATH or shutil.which("ffmpeg") or ""
    return HealthResponse(
        status="ok",
        ytdlp_version=getattr(yt_dlp.version, "__version__", "unknown"),
        ffmpeg_available=bool(ffmpeg_bin),
        ffmpeg_path=ffmpeg_bin,
        active_jobs=concurrency_limiter.active_count,
        temp_dir=str(settings.TEMP_STORAGE_PATH),
    )

@router.post("/analyze", response_model=MediaInfoResponse)
def analyze_media(req: AnalyzeRequest):
    """
    Validates URL, prevents SSRF, and extracts real media metadata and available formats via yt-dlp.
    """
    # 1. Security & SSRF Validation
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

    # 2. Extract Metadata via yt-dlp engine with concurrency limiting and timeout
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "TrueTube could not process this media. The source may be unavailable.",
                "code": "DOWNLOAD_FAILED",
            },
        )
    finally:
        concurrency_limiter.release()
