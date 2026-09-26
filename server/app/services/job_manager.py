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
    listeners: list[asyncio.Queue] = field(default_factory=list)

    def to_response(self) -> JobStatusResponse:
        download_url = f"/api/jobs/{self.id}/file" if self.status == "COMPLETED" else None
        return JobStatusResponse(
            job_id=self.id,
            status=self.status,
            progress_percent=round(self.progress_percent, 1),
            speed_str=self.speed_str,
            eta_str=self.eta_str,
            downloaded_bytes=self.downloaded_bytes,
            total_bytes=self.total_bytes,
            current_stage=self.current_stage,
            filename=self.filename,
            file_size_str=self.file_size_str,
            download_url=download_url,
            error=self.error,
            error_code=self.error_code,  # type: ignore
        )

class JobManager:
    def __init__(self):
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()
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
                job.downloaded_bytes = downloaded_bytes
            if total_bytes is not None:
                job.total_bytes = total_bytes
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

        # Notify any SSE queues
        for queue in listeners:
            try:
                queue.put_nowait(data)
            except Exception:
                pass

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
        for queue in listeners:
            try:
                queue.put_nowait(data)
            except Exception:
                pass

        # Cleanup temp directory asynchronously or safely
        if temp_dir and temp_dir.exists():
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

        return True

    def register_listener(self, job_id: str, queue: asyncio.Queue):
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.listeners.append(queue)
                # Send immediate initial state
                queue.put_nowait(job.to_response().model_dump())

    def unregister_listener(self, job_id: str, queue: asyncio.Queue):
        with self._lock:
            job = self._jobs.get(job_id)
            if job and queue in job.listeners:
                job.listeners.remove(queue)

    def _start_cleanup_worker(self):
        """Background thread that runs periodically to remove expired job directories."""
        def cleanup_loop():
            while True:
                time.sleep(300)  # Check every 5 minutes
                now = time.time()
                ttl = settings.FILE_EXPIRATION_SECONDS
                expired_ids = []

                with self._lock:
                    for j_id, job in self._jobs.items():
                        if now - job.updated_at > ttl:
                            expired_ids.append(j_id)

                for j_id in expired_ids:
                    with self._lock:
                        job = self._jobs.pop(j_id, None)
                    if job and job.temp_dir and job.temp_dir.exists():
                        try:
                            shutil.rmtree(job.temp_dir, ignore_errors=True)
                        except Exception:
                            pass

        t = threading.Thread(target=cleanup_loop, daemon=True, name="JobCleanupWorker")
        t.start()

job_manager = JobManager()
