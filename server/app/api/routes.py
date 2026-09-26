import shutil
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

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Returns system status, yt-dlp version, and FFmpeg detection info."""
    ffmpeg_bin = settings.FFMPEG_PATH or shutil.which("ffmpeg") or ""
    return HealthResponse(
        status="ok",
        ytdlp_version=getattr(yt_dlp.version, "__version__", "unknown"),
        ffmpeg_available=bool(ffmpeg_bin),
        ffmpeg_path=ffmpeg_bin,
        active_jobs=0,
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

    # 2. Extract Metadata via yt-dlp engine
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
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
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
