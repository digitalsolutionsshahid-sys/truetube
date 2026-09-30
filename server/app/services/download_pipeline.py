import os
import shutil
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any, Optional

import yt_dlp

from app.config import settings
from app.core.security import sanitize_filename
from app.models.schemas import DownloadJobRequest
from app.services.job_manager import Job, job_manager, safe_rmtree
from app.services.ytdlp_service import format_bytes, format_duration

class DownloadCancelledException(Exception):
    """Raised when download is cancelled by the user mid-stream."""
    pass

class DownloadPipeline:
    def __init__(self):
        self.executor = ThreadPoolExecutor(
            max_workers=settings.MAX_CONCURRENT_JOBS,
            thread_name_prefix="TrueTubeWorker",
        )

    def submit_job(self, job: Job):
        """Submit job to the thread pool for asynchronous execution."""
        if getattr(self.executor, "_shutdown", False):
            self.executor = ThreadPoolExecutor(
                max_workers=settings.MAX_CONCURRENT_JOBS,
                thread_name_prefix="TrueTubeWorker",
            )
        self.executor.submit(self._run_job, job)

    def _run_job(self, job: Job):
        try:
            job_manager.update_job_progress(
                job.id,
                status="ANALYZING",
                progress_percent=2.0,
                current_stage="Preparing download job and resolving formats...",
            )

            # Build yt-dlp options
            ydl_opts = self._build_ydl_opts(job)

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Check cancellation right before running
                if job.cancel_event.is_set():
                    raise DownloadCancelledException("Job was cancelled before downloading.")

                job_manager.update_job_progress(
                    job.id,
                    status="DOWNLOADING",
                    progress_percent=5.0,
                    current_stage="Connecting to media stream...",
                )

                # Execute download
                ydl.download([job.url])

            # Post-processing and finalizing
            if job.cancel_event.is_set():
                raise DownloadCancelledException("Job was cancelled during processing.")

            job_manager.update_job_progress(
                job.id,
                status="FINALIZING",
                progress_percent=98.0,
                current_stage="Finalizing media package...",
            )

            # Locate final completed file in temp_dir
            final_file = self._find_completed_file(job.temp_dir)
            if not final_file or not final_file.exists():
                raise RuntimeError("Download completed but output file could not be found.")

            file_size = final_file.stat().st_size
            clean_filename = sanitize_filename(final_file.name)

            # Rename if necessary to ensure sanitized filename
            if clean_filename != final_file.name:
                sanitized_path = final_file.parent / clean_filename
                try:
                    final_file.rename(sanitized_path)
                    final_file = sanitized_path
                except Exception:
                    pass

            job_manager.update_job_progress(
                job.id,
                status="COMPLETED",
                progress_percent=100.0,
                current_stage="Completed",
                filename=final_file.name,
                file_path=final_file,
                file_size_str=format_bytes(file_size),
            )

        except DownloadCancelledException:
            job_manager.update_job_progress(
                job.id,
                status="CANCELLED",
                current_stage="Download cancelled by user.",
            )
            # Purge partial files safely
            if job.temp_dir and job.temp_dir.exists():
                safe_rmtree(job.temp_dir)

        except Exception as e:
            err_msg = str(e)
            if job.cancel_event.is_set() or "cancelled" in err_msg.lower():
                job_manager.update_job_progress(
                    job.id,
                    status="CANCELLED",
                    current_stage="Download cancelled by user.",
                )
            else:
                job_manager.update_job_progress(
                    job.id,
                    status="FAILED",
                    current_stage="Download failed.",
                    error=err_msg,
                    error_code="DOWNLOAD_FAILED",
                )
            # Cleanup temp dir on failure safely
            if job.temp_dir and job.temp_dir.exists():
                safe_rmtree(job.temp_dir)

    def _build_ydl_opts(self, job: Job) -> dict[str, Any]:
        req = job.request
        temp_dir = str(job.temp_dir)

        # Base yt-dlp configuration with high-speed multi-threaded acceleration
        ydl_opts: dict[str, Any] = {
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "outtmpl": os.path.join(temp_dir, "%(title)s.%(ext)s"),
            "progress_hooks": [self._make_progress_hook(job)],
            "postprocessor_hooks": [self._make_postprocessor_hook(job)],
            "socket_timeout": 30,
            # High-speed download acceleration
            "concurrent_fragment_downloads": 8,  # Download DASH/HLS stream fragments across 8 parallel threads
            "buffersize": 1024 * 1024,           # 1MB buffer size for fast I/O throughput
            "http_chunk_size": 10485760,         # 10MB chunk size to avoid provider bandwidth throttling
            "format_sort": ["res", "ext:mp4:m4a"], # Prefer native MP4/M4A to enable instant stream copy without CPU-heavy re-encoding
        }

        if settings.FFMPEG_PATH:
            ydl_opts["ffmpeg_location"] = settings.FFMPEG_PATH

        ydl_opts["extractor_args"] = {
            "youtube": {
                "player_client": ["android", "ios", "web"],
                "player_skip": ["configs"],
            }
        }
        cookie_file = settings.get_cookie_file()
        if cookie_file:
            ydl_opts["cookiefile"] = cookie_file

        postprocessors = []

        # Audio stream ID sanitized
        clean_audio_id = (req.audio_stream_id or "").replace("audio_", "").strip()

        if req.audio_only:
            # Audio-only extraction mode
            target_codec = req.container if req.container in ("mp3", "m4a", "wav", "opus") else "mp3"
            audio_fmt = f"{clean_audio_id}/bestaudio/best" if clean_audio_id else "bestaudio/best"
            ydl_opts["format"] = audio_fmt
            postprocessors.append({
                "key": "FFmpegExtractAudio",
                "preferredcodec": target_codec,
                "preferredquality": "320" if req.quality_preference == "best" else "192",
            })
        else:
            # Video mode: Strictly allow MP4 container as requested
            target_container = "mp4"
            ydl_opts["merge_output_format"] = target_container

            audio_spec = (
                f"{clean_audio_id}/bestaudio[format_note*=original]/bestaudio[format_note!*=dubbed]/bestaudio"
                if clean_audio_id
                else "bestaudio[format_note*=original]/bestaudio[language_preference>=0]/bestaudio[format_note!*=dubbed]/bestaudio"
            )
            fmt = (req.format_id or "").strip()
            res = (req.resolution or "").lower().replace("p", "").strip()

            if fmt in ("best", "best_4k", "4k") or (not fmt and not res):
                ydl_opts["format"] = f"bestvideo[protocol!*=m3u8]+{audio_spec}/bestvideo+{audio_spec}/best"
            elif fmt.endswith("p") and fmt[:-1].isdigit():
                h = int(fmt[:-1])
                ydl_opts["format"] = f"bestvideo[height<={h}][protocol!*=m3u8]+{audio_spec}/best[height<={h}]/bestvideo+bestaudio/best"
            elif res.isdigit():
                h = int(res)
                ydl_opts["format"] = f"bestvideo[height<={h}][protocol!*=m3u8]+{audio_spec}/best[height<={h}]/bestvideo+bestaudio/best"
            elif "+" in fmt:
                ydl_opts["format"] = fmt
            elif fmt:
                ydl_opts["format"] = f"{fmt}+{audio_spec}/{fmt}+bestaudio/{fmt}/bestvideo[protocol!*=m3u8]+{audio_spec}/best"
            else:
                ydl_opts["format"] = f"bestvideo[protocol!*=m3u8]+{audio_spec}/bestvideo+{audio_spec}/best"

        # Embed metadata if requested
        if req.embed_metadata:
            postprocessors.append({
                "key": "FFmpegMetadata",
                "add_chapters": True,
                "add_metadata": True,
            })

        # Embed thumbnail if requested (convert to jpg first for maximum container compatibility)
        if req.embed_thumbnail and settings.FFMPEG_PATH:
            ydl_opts["writethumbnail"] = True
            postprocessors.append({"key": "FFmpegThumbnailsConvertor", "format": "jpg", "when": "before_dl"})
            postprocessors.append({"key": "EmbedThumbnail", "already_have_thumbnail": False})

        # Subtitles if requested
        if req.subtitles and req.subtitles.lower() not in ("none", ""):
            ydl_opts["writesubtitles"] = True
            ydl_opts["subtitleslangs"] = [req.subtitles.lower()]
            if not req.audio_only:
                postprocessors.append({"key": "FFmpegEmbedSubtitle"})

        if postprocessors:
            ydl_opts["postprocessors"] = postprocessors

        return ydl_opts

    def _make_progress_hook(self, job: Job):
        def hook(d: dict[str, Any]):
            # Check for cancellation on every byte chunk
            if job.cancel_event.is_set():
                raise DownloadCancelledException("Download cancelled by user.")

            status = d.get("status")
            if status == "downloading":
                try:
                    downloaded = int(round(float(d.get("downloaded_bytes") or 0)))
                except (ValueError, TypeError):
                    downloaded = 0
                try:
                    total_raw = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
                    total = int(round(float(total_raw)))
                except (ValueError, TypeError):
                    total = 0
                speed = d.get("speed") or 0.0
                eta = d.get("eta") or 0

                percent = (downloaded / total * 100.0) if total > 0 else 5.0
                percent = min(max(percent, 5.0), 94.0)  # Reserve 95-100% for postprocessing

                speed_str = f"{format_bytes(speed)}/s" if speed else "Calculating..."
                eta_str = format_duration(eta) if eta else "--:--"

                filename = d.get("filename", "")
                basename = Path(filename).name if filename else ""

                job_manager.update_job_progress(
                    job.id,
                    status="DOWNLOADING",
                    progress_percent=percent,
                    speed_str=speed_str,
                    eta_str=eta_str,
                    downloaded_bytes=downloaded,
                    total_bytes=total,
                    current_stage="Downloading media stream...",
                    filename=basename if basename else None,
                )

            elif status == "finished":
                job_manager.update_job_progress(
                    job.id,
                    status="PROCESSING",
                    progress_percent=95.0,
                    speed_str="0.0 MB/s",
                    eta_str="00:02",
                    current_stage="Processing & Merging streams with FFmpeg...",
                )

        return hook

    def _make_postprocessor_hook(self, job: Job):
        def hook(d: dict[str, Any]):
            if job.cancel_event.is_set():
                raise DownloadCancelledException("Download cancelled during postprocessing.")

            pp_status = d.get("status")
            if pp_status == "started":
                job_manager.update_job_progress(
                    job.id,
                    status="PROCESSING",
                    progress_percent=96.0,
                    current_stage="Post-processing media (merging audio/video)...",
                )
            elif pp_status == "finished":
                job_manager.update_job_progress(
                    job.id,
                    status="FINALIZING",
                    progress_percent=98.0,
                    current_stage="Finalizing output container...",
                )

        return hook

    def _find_completed_file(self, temp_dir: Path) -> Optional[Path]:
        """Find the completed output file, ignoring temporary .part, subtitle, or metadata files."""
        if not temp_dir.exists():
            return None

        ignored_exts = {
            ".part", ".ytdl", ".temp", ".tmp",
            ".vtt", ".srt", ".lrc", ".description", ".info.json",
        }
        image_exts = {".jpg", ".jpeg", ".png", ".webp"}

        candidates = []
        for p in temp_dir.iterdir():
            if p.is_file():
                if p.suffix.lower() in ignored_exts:
                    continue
                candidates.append(p)

        if not candidates:
            return None

        # If we have media files alongside image thumbnails, filter out standalone images
        media_candidates = [p for p in candidates if p.suffix.lower() not in image_exts]
        if media_candidates:
            candidates = media_candidates

        # Return largest candidate (usually the final video/audio file)
        candidates.sort(key=lambda p: p.stat().st_size, reverse=True)
        return candidates[0]

download_pipeline = DownloadPipeline()
