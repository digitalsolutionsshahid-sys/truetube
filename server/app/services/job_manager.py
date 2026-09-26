import asyncio
import os
import shutil
import threading
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Literal

from app.config import settings
from app.core.security import sanitize_filename
from app.models.schemas import DownloadJobRequest, JobStatusResponse
from app.services.ytdlp_service import format_bytes, format_duration

JobStatusType = Literal[
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

@dataclass
class Job:
    id: str
    url: str
    request: DownloadJobRequest
    status: JobStatusType = "QUEUED"
    progress_percent: float = 0.0
    speed_str: str = "0.0 MB/s"
    eta_str: str = "--:--"
    downloaded_bytes: int = 0
    total_bytes: int = 0
    current_stage: str = "Queued"
    filename: str = ""
    file_path: Optional[Path] = None
    file_size_str: str = ""
    error: Optional[str] = None
    error_code: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    cancel_event: threading.Event = field(default_factory=threading.Event)
    temp_dir: Path = field(default_factory=lambda: settings.TEMP_STORAGE_PATH)
    listeners: list[tuple[Optional[asyncio.AbstractEventLoop], asyncio.Queue]] = field(default_factory=list)

    def to_response(self) -> JobStatusResponse:
        download_url = f"/api/jobs/{self.id}/file" if self.status == "COMPLETED" else None
        return JobStatusResponse(
            job_id=self.id,
            status=self.status,
            progress_percent=round(self.progress_percent, 1),
            speed_str=self.speed_str,
            eta_str=self.eta_str,
            downloaded_bytes=int(round(float(self.downloaded_bytes or 0))),
            total_bytes=int(round(float(self.total_bytes or 0))),
            current_stage=self.current_stage,
            filename=self.filename,
            file_size_str=self.file_size_str,
            download_url=download_url,
            error=self.error,
            error_code=self.error_code,  # type: ignore
        )

def safe_rmtree(path: Path):
    """Safely delete directory handling Windows transient file locks."""
    if not path or not path.exists():
        return
    for _ in range(3):
        try:
            shutil.rmtree(path, ignore_errors=False)
            return
        except Exception:
            time.sleep(0.05)
    shutil.rmtree(path, ignore_errors=True)

def _dispatch_to_listener(loop: Optional[asyncio.AbstractEventLoop], queue: asyncio.Queue, data: dict):
    """Safely put event data onto an asyncio queue across threads."""
    if loop and loop.is_running():
        try:
            loop.call_soon_threadsafe(queue.put_nowait, data)
        except Exception:
            pass
    else:
        try:
            queue.put_nowait(data)
        except Exception:
            pass

class JobManager:
    def __init__(self):
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._start_cleanup_worker()

    def create_job(self, req: DownloadJobRequest) -> Job:
        job_id = str(uuid.uuid4())
        job_temp_dir = settings.TEMP_STORAGE_PATH / job_id
        job_temp_dir.mkdir(parents=True, exist_ok=True)

        job = Job(
            id=job_id,
            url=req.url,
            request=req,
            status="QUEUED",
            temp_dir=job_temp_dir,
        )

        with self._lock:
            self._jobs[job_id] = job

        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(job_id)

    def get_active_job_count(self) -> int:
        """Returns the number of active jobs across all in-progress states with thread safety."""
        with self._lock:
            return len([
                j for j in self._jobs.values()
                if j.status in ("QUEUED", "ANALYZING", "DOWNLOADING", "PROCESSING", "FINALIZING")
            ])

    def update_job_progress(
        self,
        job_id: str,
        status: Optional[JobStatusType] = None,
        progress_percent: Optional[float] = None,
        speed_str: Optional[str] = None,
        eta_str: Optional[str] = None,
        downloaded_bytes: Optional[int] = None,
        total_bytes: Optional[int] = None,
        current_stage: Optional[str] = None,
        filename: Optional[str] = None,
        file_path: Optional[Path] = None,
        file_size_str: Optional[str] = None,
        error: Optional[str] = None,
        error_code: Optional[str] = None,
    ):
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return

            if status is not None:
                job.status = status
            if progress_percent is not None:
                job.progress_percent = progress_percent
            if speed_str is not None:
                job.speed_str = speed_str
            if eta_str is not None:
                job.eta_str = eta_str
            if downloaded_bytes is not None:
                try:
                    job.downloaded_bytes = int(round(float(downloaded_bytes)))
                except (ValueError, TypeError):
                    job.downloaded_bytes = 0
            if total_bytes is not None:
                try:
                    job.total_bytes = int(round(float(total_bytes)))
                except (ValueError, TypeError):
                    job.total_bytes = 0
            if current_stage is not None:
                job.current_stage = current_stage
            if filename is not None:
                job.filename = filename
            if file_path is not None:
                job.file_path = file_path
            if file_size_str is not None:
                job.file_size_str = file_size_str
            if error is not None:
                job.error = error
            if error_code is not None:
                job.error_code = error_code

            job.updated_at = time.time()
            data = job.to_response().model_dump()
            listeners = list(job.listeners)

        # Notify any SSE queues thread-safely
        for loop, queue in listeners:
            _dispatch_to_listener(loop, queue, data)

    def cancel_job(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return False

            if job.status in ("COMPLETED", "FAILED", "CANCELLED"):
                return False

            job.cancel_event.set()
            job.status = "CANCELLED"
            job.current_stage = "Download cancelled by user."
            job.updated_at = time.time()
            data = job.to_response().model_dump()
            listeners = list(job.listeners)
            temp_dir = job.temp_dir

        # Notify listeners
        for loop, queue in listeners:
            _dispatch_to_listener(loop, queue, data)

        # Cleanup temp directory safely
        if temp_dir and temp_dir.exists():
            safe_rmtree(temp_dir)

        return True

    def register_listener(
        self,
        job_id: str,
        queue: asyncio.Queue,
        loop: Optional[asyncio.AbstractEventLoop] = None,
    ):
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.listeners.append((loop, queue))

    def unregister_listener(self, job_id: str, queue: asyncio.Queue):
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.listeners = [(l, q) for (l, q) in job.listeners if q is not queue]

    def clean_expired_jobs(self, ttl: Optional[int] = None) -> int:
        """Purges in-memory expired jobs and temporary directories on disk."""
        if ttl is None:
            ttl = settings.FILE_EXPIRATION_SECONDS
        now = time.time()
        expired_ids = []

        with self._lock:
            for j_id, job in self._jobs.items():
                if now - job.updated_at >= ttl:
                    expired_ids.append(j_id)

        cleaned_count = 0
        for j_id in expired_ids:
            with self._lock:
                job = self._jobs.pop(j_id, None)
            if job and job.temp_dir and job.temp_dir.exists():
                safe_rmtree(job.temp_dir)
            cleaned_count += 1

        # Also purge any orphan directories in TEMP_STORAGE_PATH older than ttl
        try:
            if settings.TEMP_STORAGE_PATH.exists():
                for item in settings.TEMP_STORAGE_PATH.iterdir():
                    if item.is_dir():
                        try:
                            mtime = item.stat().st_mtime
                            if now - mtime >= ttl:
                                safe_rmtree(item)
                                cleaned_count += 1
                        except Exception:
                            pass
        except Exception:
            pass

        return cleaned_count

    def _start_cleanup_worker(self):
        """Background thread that runs periodically to remove expired job directories."""
        def cleanup_loop():
            while not self._stop_event.wait(300):
                self.clean_expired_jobs()

        t = threading.Thread(target=cleanup_loop, daemon=True, name="JobCleanupWorker")
        t.start()

    def shutdown(self):
        """Signals worker thread to stop, marks active jobs cancelled, and cleans storage."""
        self._stop_event.set()
        with self._lock:
            for job in self._jobs.values():
                job.cancel_event.set()
        self.clean_expired_jobs(ttl=0)

job_manager = JobManager()
