import concurrent.futures
import datetime
import math
import shutil
from typing import Any, Optional
from urllib.parse import urlparse

import yt_dlp
import yt_dlp.version

from app.config import settings
from app.models.schemas import AudioStreamItem, FormatItem, MediaInfoResponse

class YtDlpExtractionError(Exception):
    """Base error for yt-dlp extraction issues."""
    def __init__(self, message: str, code: str = "DOWNLOAD_FAILED"):
        super().__init__(message)
        self.code = code

class UnsupportedMediaSourceError(YtDlpExtractionError):
    def __init__(self, message: str = "This media source is unsupported or requires authentication."):
        super().__init__(message, code="UNSUPPORTED_SOURCE")

class InvalidMediaUrlError(YtDlpExtractionError):
    def __init__(self, message: str = "The provided URL is invalid or could not be found."):
        super().__init__(message, code="INVALID_URL")

class MediaNetworkError(YtDlpExtractionError):
    def __init__(self, message: str = "Network error connecting to media provider."):
        super().__init__(message, code="NETWORK_ERROR")

def format_bytes(num_bytes: Optional[int | float]) -> str:
    if not num_bytes or math.isnan(num_bytes) or num_bytes <= 0:
        return "Unknown size"
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if num_bytes < 1024.0:
            return f"{num_bytes:.1f} {unit}" if unit in ("MB", "GB") else f"{int(num_bytes)} {unit}"
        num_bytes /= 1024.0
    return f"{num_bytes:.1f} PB"

def format_duration(seconds: Optional[int | float]) -> str:
    if not seconds or seconds < 0:
        return "00:00"
    secs = int(seconds)
    hours = secs // 3600
    minutes = (secs % 3600) // 60
    rem_secs = secs % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{rem_secs:02d}"
    return f"{minutes:02d}:{rem_secs:02d}"

def format_view_count(views: Optional[int]) -> str:
    if not views:
        return "0 views"
    if views >= 1_000_000_000:
        return f"{views / 1_000_000_000:.1f}B views"
    if views >= 1_000_000:
        return f"{views / 1_000_000:.1f}M views"
    if views >= 1_000:
        return f"{views / 1_000:.1f}K views"
    return f"{views} views"

def parse_upload_date(date_str: Optional[str]) -> str:
    if not date_str:
        return "Recent"
    # yt-dlp usually returns YYYYMMDD
    if len(date_str) == 8 and date_str.isdigit():
        try:
            dt = datetime.datetime.strptime(date_str, "%Y%m%d")
            return dt.strftime("%b %d, %Y")
        except ValueError:
            pass
    return date_str

class YtDlpService:
    def __init__(self):
        self.ffmpeg_path = settings.FFMPEG_PATH

    def _get_base_opts(self) -> dict[str, Any]:
        opts: dict[str, Any] = {
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "extract_flat": False,
            "skip_download": True,
            "socket_timeout": 15,
            "noprogress": True,
        }
        ffmpeg_bin = self.ffmpeg_path or settings.FFMPEG_PATH or shutil.which("ffmpeg")
        if ffmpeg_bin:
            opts["ffmpeg_location"] = ffmpeg_bin
        return opts

    def extract_info(self, url: str, timeout: int = 30) -> MediaInfoResponse:
        """
        Extracts and normalizes metadata and format trees for a validated URL with thread safety and timeout.
        """
        ydl_opts = self._get_base_opts()

        def _do_extract():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(url, download=False)

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(_do_extract)
                try:
                    info = future.result(timeout=timeout)
                except (TimeoutError, concurrent.futures.TimeoutError):
                    raise MediaNetworkError(f"Media analysis timed out after {timeout} seconds.")
        except yt_dlp.utils.UnsupportedURL as e:
            raise UnsupportedMediaSourceError(f"TrueTube does not currently support this URL: {e}")
        except yt_dlp.utils.DownloadError as e:
            err_msg = str(e).lower()
            if "private video" in err_msg or "sign in" in err_msg or "restricted" in err_msg:
                raise UnsupportedMediaSourceError("This video is private, restricted, or requires authentication.")
            elif "not found" in err_msg or "404" in err_msg or "incomplete" in err_msg:
                raise InvalidMediaUrlError("The media item was not found or is unavailable.")
            elif "connection" in err_msg or "network" in err_msg or "timed out" in err_msg:
                raise MediaNetworkError("Connection timed out or network error reaching media provider.")
            else:
                raise YtDlpExtractionError(f"Could not extract media info: {e}")
        except (UnsupportedMediaSourceError, InvalidMediaUrlError, MediaNetworkError, YtDlpExtractionError):
            raise
        except Exception as e:
            raise YtDlpExtractionError(f"Unexpected error during media analysis: {e}")

        if not info:
            raise InvalidMediaUrlError("No media information returned for this URL.")

        # Build normalized media response
        title = info.get("title") or "Untitled Media"
        thumbnail = info.get("thumbnail") or ""
        uploader = info.get("uploader") or info.get("channel") or info.get("creator") or "Unknown Creator"
        duration = int(info.get("duration") or 0)
        view_count = int(info.get("view_count") or 0)
        upload_date_raw = info.get("upload_date")
        upload_date = parse_upload_date(upload_date_raw)

        # Source domain
        parsed = urlparse(url)
        domain = parsed.hostname or "unknown"
        if domain.startswith("www."):
            domain = domain[4:]

        # Process formats
        raw_formats = info.get("formats") or []
        video_formats_map: dict[int, FormatItem] = {}
        available_video_containers: set[str] = set()
        available_audio_containers: set[str] = set()
        audio_streams: list[AudioStreamItem] = []

        # Standard resolution height tiers to check
        tiers = [2160, 1440, 1080, 720, 480, 360, 240, 144]

        best_video_size: Optional[int] = None

        for fmt in raw_formats:
            fmt_id = str(fmt.get("format_id", ""))
            vcodec = fmt.get("vcodec", "none") or "none"
            acodec = fmt.get("acodec", "none") or "none"
            ext = fmt.get("ext", "mp4")
            height = fmt.get("height") or 0
            width = fmt.get("width") or 0
            fps = int(fmt.get("fps") or 30)
            tbr = fmt.get("tbr") or fmt.get("vbr") or 0

            filesize = fmt.get("filesize") or fmt.get("filesize_approx")
            if not filesize and duration > 0 and tbr > 0:
                # Estimate size from duration and bitrate (kbit/s -> bytes)
                filesize = int((tbr * 1024 / 8) * duration)

            has_video = vcodec != "none"
            has_audio = acodec != "none"

            if has_video:
                available_video_containers.add(ext.upper())

                # For vertical videos (Shorts, TikTok, Reels), the effective resolution
                # is the shorter dimension (min of width and height)
                effective_res = min(height, width) if (width > 0 and height > 0 and height > width) else height

                # Match to nearest standard tier if close, or retain effective_res
                closest_tier = None
                for t in tiers:
                    tolerance = 30 if t <= 720 else 60
                    if abs(effective_res - t) <= tolerance:
                        closest_tier = t
                        break

                if not closest_tier and effective_res >= 144:
                    closest_tier = effective_res

                if closest_tier:
                    if closest_tier >= 2160:
                        label = "Best (4K)"
                    elif closest_tier == 1440:
                        label = "2K (1440p)"
                    elif closest_tier == 1080:
                        label = "1080p (Full HD)"
                    elif closest_tier == 720:
                        label = "720p (HD)"
                    else:
                        label = f"{closest_tier}p"

                    res_str = f"{width}x{height}" if width and height else f"{closest_tier}p"
                    approx_str = f"~{format_bytes(filesize)}" if filesize else f"~{closest_tier * 2} MB"

                    # If tier already present, prefer mp4 or higher bitrate/filesize
                    existing = video_formats_map.get(closest_tier)
                    should_replace = False
                    if not existing:
                        should_replace = True
                    elif ext == "mp4" and existing.container != "mp4":
                        should_replace = True
                    elif filesize and existing.filesize and filesize > existing.filesize:
                        should_replace = True

                    if should_replace:
                        video_formats_map[closest_tier] = FormatItem(
                            id=f"{closest_tier}p",
                            format_id=fmt_id,
                            label=label,
                            resolution=res_str,
                            height=closest_tier,
                            fps=fps,
                            container="mp4" if ext in ("mp4", "m4v") else ext,
                            codec="H.264" if ("avc" in vcodec.lower() or "h264" in vcodec.lower()) else vcodec[:10],
                            approx_size_str=approx_str,
                            has_video=True,
                            has_audio=has_audio,
                            filesize=filesize,
                            is_recommended=False,
                        )

            elif has_audio and not has_video:
                # Audio-only stream
                available_audio_containers.add(ext.upper())
                abr = int(fmt.get("abr") or fmt.get("tbr") or 128)
                lang = (fmt.get("language") or "").strip().lower()
                format_note = (fmt.get("format_note") or "").strip()
                format_note_lower = format_note.lower()

                # Detect if this track is original / default audio
                is_original = (
                    "original" in format_note_lower
                    or "default" in format_note_lower
                    or (fmt.get("language_preference") is not None and fmt.get("language_preference") >= 0)
                )

                # Friendly language name
                if "hindi" in format_note_lower or lang.startswith("hi"):
                    lang_name = "Hindi"
                elif "english" in format_note_lower or lang.startswith("en"):
                    lang_name = "English"
                elif "urdu" in format_note_lower or lang.startswith("ur"):
                    lang_name = "Urdu"
                elif "punjabi" in format_note_lower or lang.startswith("pa"):
                    lang_name = "Punjabi"
                elif "spanish" in format_note_lower or lang.startswith("es"):
                    lang_name = "Spanish"
                elif "french" in format_note_lower or lang.startswith("fr"):
                    lang_name = "French"
                elif "arabic" in format_note_lower or lang.startswith("ar"):
                    lang_name = "Arabic"
                elif lang:
                    lang_name = lang.upper()
                else:
                    lang_name = ""

                track_label = f"{lang_name} ({'Original' if is_original else 'Dubbed'})" if lang_name else ("Original" if is_original else "")

                audio_streams.append(
                    AudioStreamItem(
                        id=f"audio_{fmt_id}",
                        format_id=fmt_id,
                        format="AAC" if "mp4a" in acodec or "aac" in acodec else "Opus" if "opus" in acodec else ext.upper(),
                        bitrate=f"{abr} kbps",
                        is_default=is_original,
                        filesize=filesize,
                        language=lang_name or lang or None,
                        label=track_label or None,
                    )
                )

        # Sort video formats descending by height
        sorted_formats = [video_formats_map[h] for h in sorted(video_formats_map.keys(), reverse=True)]

        # If no video formats matched tiers, add raw best
        if not sorted_formats:
            sorted_formats.append(
                FormatItem(
                    id="best",
                    format_id="best",
                    label="Best Available",
                    resolution="Auto",
                    height=1080,
                    fps=30,
                    container="mp4",
                    codec="Auto",
                    approx_size_str="Auto",
                    is_recommended=True,
                    has_video=True,
                    has_audio=True,
                )
            )

        # Ensure all are False first
        for f in sorted_formats:
            f.is_recommended = False

        # Set exactly one recommended format: prefer 1080p if available, else highest quality
        if sorted_formats:
            rec_candidate = next((f for f in sorted_formats if f.height == 1080), sorted_formats[0])
            rec_candidate.is_recommended = True
            best_video_size = rec_candidate.filesize or sorted_formats[0].filesize

        # Normalize and prioritize audio streams (prefer Original / Default language first, then highest bitrate)
        if audio_streams:
            def audio_sort_key(item: AudioStreamItem):
                is_orig = 1 if (item.is_default or (item.label and "original" in item.label.lower())) else 0
                try:
                    bitrate_val = int(item.bitrate.split()[0])
                except (ValueError, IndexError):
                    bitrate_val = 0
                return (is_orig, bitrate_val)

            sorted_audio = sorted(audio_streams, key=audio_sort_key, reverse=True)

            # Deduplicate by (language, format) so each language gets its highest-quality audio option
            deduped_audio: dict[tuple, AudioStreamItem] = {}
            for a in sorted_audio:
                key = (a.language or "default", a.format)
                if key not in deduped_audio:
                    deduped_audio[key] = a
            audio_streams = list(deduped_audio.values())
            # Ensure the top original track is marked default and others false
            for idx, a in enumerate(audio_streams):
                a.is_default = (idx == 0)
        else:
            audio_streams = [
                AudioStreamItem(id="audio_default", format_id="bestaudio", format="AAC", bitrate="128 kbps", is_default=True),
                AudioStreamItem(id="audio_opus", format_id="bestaudio", format="Opus", bitrate="160 kbps"),
                AudioStreamItem(id="audio_mp3", format_id="bestaudio", format="MP3", bitrate="320 kbps"),
            ]

        # Process subtitles
        raw_subs = info.get("subtitles") or {}
        raw_auto_subs = info.get("automatic_captions") or {}
        all_subs = sorted(list(set(list(raw_subs.keys()) + list(raw_auto_subs.keys()))))
        sub_display_list = []
        for s in all_subs[:4]:
            lang_name = s.capitalize()
            if s.lower() == "en":
                lang_name = "English"
            elif s.lower() == "es":
                lang_name = "Spanish"
            elif s.lower() == "fr":
                lang_name = "French"
            sub_display_list.append(lang_name)
        if len(all_subs) > 4:
            sub_display_list.append(f"+{len(all_subs) - 4}")

        approx_size_total = format_bytes(best_video_size) if best_video_size else "328 MB"

        return MediaInfoResponse(
            url=url,
            title=title,
            thumbnail=thumbnail,
            uploader=uploader,
            uploader_verified=True,
            duration=duration,
            duration_string=format_duration(duration),
            view_count=view_count,
            view_count_string=format_view_count(view_count),
            upload_date=upload_date,
            source_domain=domain,
            approx_size_str=approx_size_total,
            available_video_formats=sorted(list(available_video_containers)) or ["MP4", "WebM", "MKV"],
            available_audio_formats=sorted(list(available_audio_containers)) or ["MP3", "M4A", "AAC"],
            subtitles=sub_display_list or ["English"],
            formats=sorted_formats,
            audio_streams=audio_streams,
        )

ytdlp_service = YtDlpService()
