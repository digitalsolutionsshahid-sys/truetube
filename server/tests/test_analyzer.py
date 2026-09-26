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
        "http://[::1]/test",
        "http://[::]/test",
        "http://localhost.localdomain/secret",
        "http://service.internal/status",
    ]
    for url in dangerous_urls:
        with pytest.raises(SSRFBlockedError):
            validate_and_sanitize_url(url)

def test_block_embedded_credentials():
    credential_urls = [
        "http://admin:secret@example.com/video",
        "https://user:password@youtube.com/watch?v=123",
        "http://attacker.com@127.0.0.1/",
    ]
    for url in credential_urls:
        with pytest.raises(SecurityValidationError) as exc_info:
            validate_and_sanitize_url(url)
        assert "embedded credentials" in str(exc_info.value).lower()

def test_block_integer_and_hex_ips():
    int_hex_urls = [
        "http://2130706433/",       # 127.0.0.1 in decimal integer
        "http://0x7f000001/",       # 127.0.0.1 in hexadecimal
    ]
    for url in int_hex_urls:
        with pytest.raises(SSRFBlockedError):
            validate_and_sanitize_url(url)

def test_block_dangerous_ports():
    bad_port_urls = [
        "http://example.com:22/video.mp4",
        "http://example.com:25/mail",
        "http://example.com:6379/redis",
        "http://example.com:11211/memcached",
    ]
    for url in bad_port_urls:
        with pytest.raises(SecurityValidationError) as exc_info:
            validate_and_sanitize_url(url)
        assert "blocked for security" in str(exc_info.value).lower()

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
        "https://example.com:8443/video.mp4",
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
    # Windows reserved device names
    assert sanitize_filename("CON.mp4") == "truetube_CON.mp4"
    assert sanitize_filename("nul.avi") == "truetube_nul.avi"
    assert sanitize_filename("aux.mp3") == "truetube_aux.mp3"
    assert sanitize_filename("prn.mp4") == "truetube_prn.mp4"

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
    assert "active_jobs" in data
    assert isinstance(data["active_jobs"], int)

def test_analyze_rejects_ssrf():
    response = client.post("/api/analyze", json={"url": "http://127.0.0.1:8000/api"})
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "UNSUPPORTED_SOURCE"

def test_analyze_rejects_credentials_in_url():
    response = client.post("/api/analyze", json={"url": "http://admin:secret@youtube.com/watch?v=abc"})
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "INVALID_URL"

def test_analyze_rejects_invalid_scheme():
    response = client.post("/api/analyze", json={"url": "file:///etc/shadow"})
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "INVALID_URL"

def test_analyze_rejects_empty_url():
    response = client.post("/api/analyze", json={"url": "   "})
    assert response.status_code in (400, 422)

# ----------------------------------------------------
# 3. YtDlpService Extraction, Format Parsing & Errors
# ----------------------------------------------------

def test_analyze_mock_or_real_media(monkeypatch):
    """Verify format parsing, resolution normalization, and schema serialization."""
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
    # Verify ONLY one item has is_recommended == True
    recommended_count = sum(1 for f in res.formats if f.is_recommended)
    assert recommended_count == 1
    assert len(res.audio_streams) >= 1
    assert "English" in res.subtitles

def test_vertical_video_and_nonstandard_resolutions(monkeypatch):
    """Verify that vertical videos (Shorts/TikTok 1080x1920) and non-standard resolutions (540p) are properly handled."""
    from app.services.ytdlp_service import ytdlp_service

    vertical_info = {
        "title": "Vertical Shorts Video",
        "duration": 45,
        "formats": [
            {
                "format_id": "vert_1080",
                "vcodec": "h264",
                "acodec": "aac",
                "ext": "mp4",
                "width": 1080,
                "height": 1920,   # Vertical 1080p
                "fps": 60,
                "tbr": 3500,
            },
            {
                "format_id": "vert_540",
                "vcodec": "h264",
                "acodec": "aac",
                "ext": "mp4",
                "width": 540,
                "height": 960,    # Vertical 540p
                "fps": 30,
                "tbr": 1200,
            }
        ],
    }

    class DummyYDL:
        def __init__(self, *args, **kwargs):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def extract_info(self, url, download=False):
            return vertical_info

    monkeypatch.setattr("yt_dlp.YoutubeDL", DummyYDL)

    res = ytdlp_service.extract_info("https://www.tiktok.com/@user/video/999")
    heights = [f.height for f in res.formats]
    assert 1080 in heights
    assert 540 in heights
    # Exactly one format must be recommended
    assert sum(1 for f in res.formats if f.is_recommended) == 1

def test_analyze_error_mappings(monkeypatch):
    """Verify that service exceptions are properly translated to client HTTP error responses."""
    from app.services.ytdlp_service import (
        InvalidMediaUrlError,
        MediaNetworkError,
        UnsupportedMediaSourceError,
    )

    # 1. Test 404 for InvalidMediaUrlError
    def raise_invalid(*args, **kwargs):
        raise InvalidMediaUrlError("Item not found")

    monkeypatch.setattr("app.services.ytdlp_service.ytdlp_service.extract_info", raise_invalid)
    resp = client.post("/api/analyze", json={"url": "https://www.youtube.com/watch?v=notfound"})
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "INVALID_URL"

    # 2. Test 422 for UnsupportedMediaSourceError
    def raise_unsupported(*args, **kwargs):
        raise UnsupportedMediaSourceError("Private video")

    monkeypatch.setattr("app.services.ytdlp_service.ytdlp_service.extract_info", raise_unsupported)
    resp = client.post("/api/analyze", json={"url": "https://www.youtube.com/watch?v=private"})
    assert resp.status_code == 422
    assert resp.json()["detail"]["code"] == "UNSUPPORTED_SOURCE"

    # 3. Test 504 for MediaNetworkError
    def raise_timeout(*args, **kwargs):
        raise MediaNetworkError("Extraction timed out")

    monkeypatch.setattr("app.services.ytdlp_service.ytdlp_service.extract_info", raise_timeout)
    resp = client.post("/api/analyze", json={"url": "https://www.youtube.com/watch?v=hang"})
    assert resp.status_code == 504
    assert resp.json()["detail"]["code"] == "NETWORK_ERROR"

def test_concurrency_limiter():
    """Verify thread-safe limiter bounds and active task counter."""
    from app.api.routes import ConcurrencyLimiter

    limiter = ConcurrencyLimiter(max_concurrent=2)
    assert limiter.active_count == 0

    assert limiter.acquire(timeout=0.1) is True
    assert limiter.active_count == 1

    assert limiter.acquire(timeout=0.1) is True
    assert limiter.active_count == 2

    # Third acquire should fail when max_concurrent=2
    assert limiter.acquire(timeout=0.05) is False
    assert limiter.active_count == 2

    limiter.release()
    assert limiter.active_count == 1
    limiter.release()
    assert limiter.active_count == 0
