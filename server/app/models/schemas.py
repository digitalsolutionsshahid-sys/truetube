from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="URL of the media to analyze", min_length=5)

class FormatItem(BaseModel):
    id: str
    format_id: str
    label: str
    resolution: str
    height: int
    fps: int
    container: str
    codec: str
    approx_size_str: str
    is_recommended: bool = False
    has_video: bool = True
    has_audio: bool = False
    filesize: Optional[int] = None

class AudioStreamItem(BaseModel):
    id: str
    format_id: str
    format: str
    bitrate: str
    is_default: bool = False
    filesize: Optional[int] = None
    language: Optional[str] = None
    label: Optional[str] = None

class MediaInfoResponse(BaseModel):
    url: str
    title: str
    thumbnail: str
    uploader: str
    uploader_verified: bool = False
    duration: int
    duration_string: str
    view_count: int
    view_count_string: str
    upload_date: str
    source_domain: str
    approx_size_str: str
    available_video_formats: list[str]
    available_audio_formats: list[str]
    subtitles: list[str]
    formats: list[FormatItem]
    audio_streams: list[AudioStreamItem]

class DownloadJobRequest(BaseModel):
    url: str
    format_id: Optional[str] = None
    resolution: Optional[str] = None
    container: Literal["mp4", "webm", "mkv", "avi", "mp3", "m4a", "wav", "opus"] = "mp4"
    audio_stream_id: Optional[str] = None
    audio_only: bool = False
    subtitles: Optional[str] = None
    embed_metadata: bool = True
    embed_thumbnail: bool = False
    filename_template: Optional[str] = "%(title)s.%(ext)s"
    quality_preference: Literal["best", "high", "medium", "low"] = "best"

class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal[
        "IDLE",
        "ANALYZING",
        "QUEUED",
        "DOWNLOADING",
        "PROCESSING",
        "FINALIZING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
    ]
    progress_percent: float = 0.0
    speed_str: str = "0.0 MB/s"
    eta_str: str = "--:--"
    downloaded_bytes: int = 0
    total_bytes: int = 0

    @field_validator("downloaded_bytes", "total_bytes", mode="before")
    @classmethod
    def coerce_bytes_to_int(cls, v):
        if v is None:
            return 0
        try:
            return int(round(float(v)))
        except (ValueError, TypeError):
            return 0
    current_stage: str = "Queued"
    filename: str = ""
    file_size_str: str = ""
    download_url: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[
        Literal["INVALID_URL", "UNSUPPORTED_SOURCE", "NETWORK_ERROR", "DOWNLOAD_FAILED"]
    ] = None

class HealthResponse(BaseModel):
    status: str
    ytdlp_version: str
    ffmpeg_available: bool
    ffmpeg_path: str
    active_jobs: int
    temp_dir: str
