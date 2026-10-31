import os
import json
import shutil
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"
TEMP_DIR = STORAGE_DIR / "temp"

# Ensure storage directories exist
TEMP_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    APP_NAME: str = "TrueTube Engine"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("TRUETUBE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("TRUETUBE_PORT", "8000"))
    DEBUG: bool = os.getenv("TRUETUBE_DEBUG", "false").lower() == "true"

    # Storage paths
    STORAGE_PATH: Path = STORAGE_DIR
    TEMP_STORAGE_PATH: Path = TEMP_DIR

    # Concurrency and safety limits
    MAX_CONCURRENT_JOBS: int = int(os.getenv("TRUETUBE_MAX_JOBS", os.getenv("TRUETUBE_MAX_CONCURRENT_JOBS", "5")))
    JOB_TIMEOUT_SECONDS: int = int(os.getenv("TRUETUBE_JOB_TIMEOUT", "900"))  # 15 minutes
    FILE_EXPIRATION_SECONDS: int = int(os.getenv("TRUETUBE_FILE_TTL", os.getenv("TRUETUBE_FILE_EXPIRATION_SECONDS", "3600")))  # 1 hour

    # FFmpeg / FFprobe path
    FFMPEG_PATH: str = os.getenv("FFMPEG_PATH", shutil.which("ffmpeg") or "")
    FFPROBE_PATH: str = os.getenv("FFPROBE_PATH", shutil.which("ffprobe") or "")

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("TRUETUBE_ALLOWED_ORIGINS", "*").split(",")
        if o.strip()
    ]

    # Anti-Bot & Cookies (YouTube, Instagram, etc.)
    YOUTUBE_COOKIES_PATH: str = os.getenv("YOUTUBE_COOKIES_PATH", "")
    YOUTUBE_COOKIES: str = os.getenv("YOUTUBE_COOKIES", "")
    COOKIES_PATH: str = os.getenv("COOKIES_PATH", "")
    COOKIES: str = os.getenv("COOKIES", "")
    INSTAGRAM_COOKIES: str = os.getenv("INSTAGRAM_COOKIES", "")

    def _normalize_cookie_content(self, raw: str) -> str:
        """Converts JSON cookie arrays (from browser extensions) to Netscape HTTP cookie format."""
        cleaned = raw.strip()
        if not cleaned:
            return ""
        if (cleaned.startswith("[") and cleaned.endswith("]")) or (cleaned.startswith("{") and cleaned.endswith("}")):
            try:
                data = json.loads(cleaned)
                if isinstance(data, dict):
                    data = [data]
                if isinstance(data, list):
                    lines = []
                    for c in data:
                        if isinstance(c, dict):
                            domain = c.get("domain", "")
                            include_sub = "TRUE" if domain.startswith(".") else "FALSE"
                            path = c.get("path", "/")
                            secure = "TRUE" if c.get("secure", False) else "FALSE"
                            expires = str(int(c.get("expirationDate", 0) or 0))
                            name = c.get("name", "")
                            value = c.get("value", "")
                            if name and domain:
                                lines.append(f"{domain}\t{include_sub}\t{path}\t{secure}\t{expires}\t{name}\t{value}")
                    if lines:
                        return "\n".join(lines)
            except Exception:
                pass
        return cleaned

    def get_cookie_file(self) -> str | None:
        """Returns the path to a valid cookies file, or writes raw COOKIES / YOUTUBE_COOKIES content to disk."""
        path_candidate = self.COOKIES_PATH or self.YOUTUBE_COOKIES_PATH
        if path_candidate and os.path.isfile(path_candidate):
            return path_candidate

        cookie_parts = []
        if self.COOKIES:
            norm = self._normalize_cookie_content(self.COOKIES)
            if norm:
                cookie_parts.append(norm)
        if self.YOUTUBE_COOKIES:
            norm = self._normalize_cookie_content(self.YOUTUBE_COOKIES)
            if norm:
                cookie_parts.append(norm)
        if self.INSTAGRAM_COOKIES:
            norm = self._normalize_cookie_content(self.INSTAGRAM_COOKIES)
            if norm:
                cookie_parts.append(norm)

        if cookie_parts:
            header = "# Netscape HTTP Cookie File\n# https://curl.se/docs/http-cookies.html\n\n"
            raw_cookies = header + "\n\n".join(cookie_parts) + "\n"
            target = self.STORAGE_PATH / "cookies.txt"
            try:
                if not target.exists() or target.read_text(encoding="utf-8") != raw_cookies:
                    target.write_text(raw_cookies, encoding="utf-8")
                return str(target)
            except Exception:
                pass
        return None

settings = Settings()
