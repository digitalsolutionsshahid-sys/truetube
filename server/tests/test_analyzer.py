import pytest
from fastapi.testclient import TestClient

from app.core.security import (
    SecurityValidationError,
    SSRFBlockedError,
    sanitize_filename,
    validate_and_sanitize_url,
)
from app.main import app

client = TestClient(app)

# ----------------------------------------------------
# 1. Security & SSRF Unit Tests
# ----------------------------------------------------

def test_block_local_and_private_ips():
    dangerous_urls = [
        "http://localhost:8000/api",
        "http://127.0.0.1/test",
        "http://127.0.0.1:9000",
        "http://0.0.0.0/",
        "http://10.0.0.1/internal",
        "http://192.168.1.1/router",
        "http://172.16.0.10/admin",
        "http://169.254.169.254/latest/meta-data/",
    ]
    for url in dangerous_urls:
        with pytest.raises(SSRFBlockedError):
            validate_and_sanitize_url(url)

def test_block_disallowed_schemes():
    bad_schemes = [
        "file:///C:/Windows/win.ini",
        "file:///etc/passwd",
        "ftp://files.example.com/movie.mp4",
        "gopher://evil.com",
        "data:text/html,<script>alert(1)</script>",
        "javascript:alert(1)",
        "",
        "not_a_url",
    ]
    for url in bad_schemes:
        with pytest.raises(SecurityValidationError):
            validate_and_sanitize_url(url)

def test_valid_public_urls():
    valid = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "http://vimeo.com/76979871",
        "https://tiktok.com/@user/video/1234567890",
        "https://x.com/sample/status/12345",
    ]
    for url in valid:
        assert validate_and_sanitize_url(url) == url

def test_filename_sanitization():
    assert ".." not in sanitize_filename("../../../etc/passwd")
    assert "/" not in sanitize_filename("folder/nested/video.mp4")
    assert "\\" not in sanitize_filename("C:\\Windows\\System32\\file.mp4")
    assert ":" not in sanitize_filename("video:colon*star?.mp4")
    assert sanitize_filename("") == "truetube_download.mp4"
    assert len(sanitize_filename("a" * 300 + ".mp4")) <= 200

# ----------------------------------------------------
# 2. API Endpoint Tests
# ----------------------------------------------------

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["ffmpeg_available"] is True
    assert "yt_dlp" in data or len(data["ytdlp_version"]) > 0

def test_analyze_rejects_ssrf():
    response = client.post("/api/analyze", json={"url": "http://127.0.0.1:8000/api"})
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "UNSUPPORTED_SOURCE"

def test_analyze_rejects_invalid_scheme():
    response = client.post("/api/analyze", json={"url": "file:///etc/shadow"})
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "INVALID_URL"

def test_analyze_rejects_empty_url():
    response = client.post("/api/analyze", json={"url": "   "})
    assert response.status_code in (400, 422)

# ----------------------------------------------------
# 3. YtDlpService Extraction Test
# ----------------------------------------------------

def test_analyze_mock_or_real_media(monkeypatch):
    """Verify format parsing and schema serialization using mock yt-dlp dictionary."""
    from app.services.ytdlp_service import ytdlp_service

    dummy_info = {
        "title": "Big Buck Bunny Test",
        "thumbnail": "https://example.com/thumb.jpg",
        "uploader": "Blender Foundation",
        "duration": 596,
        "view_count": 5000000,
        "upload_date": "20080520",
        "formats": [
            {
                "format_id": "137",
                "vcodec": "avc1.640028",
                "acodec": "none",
                "ext": "mp4",
                "height": 1080,
                "width": 1920,
                "fps": 30,
                "filesize": 150000000,
            },
            {
                "format_id": "22",
                "vcodec": "avc1.64001F",
                "acodec": "mp4a.40.2",
                "ext": "mp4",
                "height": 720,
                "width": 1280,
                "fps": 30,
                "filesize": 80000000,
            },
            {
                "format_id": "140",
                "vcodec": "none",
                "acodec": "mp4a.40.2",
                "ext": "m4a",
                "abr": 128,
                "filesize": 9000000,
            },
        ],
        "subtitles": {"en": [{"ext": "vtt"}]},
    }

    # Monkeypatch extract_info of YoutubeDL
    class DummyYDL:
        def __init__(self, *args, **kwargs):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def extract_info(self, url, download=False):
            return dummy_info

    monkeypatch.setattr("yt_dlp.YoutubeDL", DummyYDL)

    res = ytdlp_service.extract_info("https://www.youtube.com/watch?v=aqz-KE-bpKQ")
    assert res.title == "Big Buck Bunny Test"
    assert res.duration_string == "09:56"
    assert res.duration == 596
    assert len(res.formats) >= 2
    assert res.formats[0].height == 1080
    assert res.formats[0].is_recommended is True
    assert len(res.audio_streams) >= 1
    assert "English" in res.subtitles
