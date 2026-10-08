import pytest
from unittest.mock import MagicMock, patch
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from app.services.ytdlp_service import YtDlpService

client = TestClient(app)

def test_instagram_progressive_format_detection():
    """Verify that Instagram formats with vcodec=None but video_ext='mp4' are recognized."""
    mock_instagram_raw = {
        "title": "Video by liftwith_aditya",
        "thumbnail": "https://instagram.example.com/thumb.jpg",
        "uploader": "liftwith_aditya",
        "duration": 12,
        "view_count": 50000,
        "upload_date": "20261007",
        "formats": [
            {
                "format_id": "dash-audio",
                "vcodec": "none",
                "acodec": "mp4a.40.5",
                "ext": "m4a",
                "protocol": "https",
            },
            {
                "format_id": "1",
                "vcodec": None,
                "acodec": None,
                "ext": "mp4",
                "video_ext": "mp4",
                "audio_ext": "none",
                "height": None,
                "protocol": "https",
            },
            {
                "format_id": "dash-1080v",
                "vcodec": "vp09.00.40",
                "acodec": "none",
                "ext": "mp4",
                "height": 1920,
                "width": 1080,
                "protocol": "https",
            },
        ],
    }

    service = YtDlpService()
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_ydl = MagicMock()
        mock_ydl.extract_info.return_value = mock_instagram_raw
        mock_ydl.__enter__.return_value = mock_ydl
        mock_ydl_cls.return_value = mock_ydl

        resp = service.extract_info("https://www.instagram.com/reel/DeLXFcoAsVU/")

        assert len(resp.formats) >= 2
        # Check 720p format from progressive stream '1'
        fmt_720 = next((f for f in resp.formats if f.height == 720), None)
        assert fmt_720 is not None
        assert fmt_720.format_id == "1"
        assert fmt_720.has_video is True
        assert fmt_720.has_audio is True

        # Check 1080p format from DASH video
        fmt_1080 = next((f for f in resp.formats if f.height == 1080), None)
        assert fmt_1080 is not None
        assert fmt_1080.format_id == "dash-1080v"

def test_direct_stream_download_error_sets_cookie():
    """Verify that a failing download cleans up and sets the truetube_err cookie."""
    mock_proc = MagicMock()
    mock_proc.returncode = 1
    mock_proc.communicate.return_value = (b"", b"Error downloading format")
    mock_proc.stdout.read.return_value = b""

    with patch("subprocess.Popen", return_value=mock_proc):
        token = "test_token_999"
        resp = client.get(
            "/api/download/direct",
            params={
                "url": "https://www.instagram.com/reel/invalid/",
                "token": token,
                "format_id": "bad_format",
            },
        )
        assert resp.status_code == 400
        # Cookie must be set to signal frontend error
        cookies = resp.headers.get("set-cookie", "")
        assert f"truetube_err_{token}=1" in cookies

def test_direct_stream_download_success_sets_cookie_and_accept_ranges():
    """Verify that successful direct download returns FileResponse with accept-ranges and success cookie."""
    mock_proc = MagicMock()
    mock_proc.returncode = 0
    # Simulate stdout providing media bytes for mock
    mock_proc.communicate.return_value = (b"\x00\x00\x00 ftypisom" + b"\x00" * 100, b"")
    mock_proc.stdout.read.return_value = b"\x00\x00\x00 ftypisom" + b"\x00" * 100

    with patch("subprocess.Popen", return_value=mock_proc):
        token = "test_token_success"
        resp = client.get(
            "/api/download/direct",
            params={
                "url": "https://www.instagram.com/reel/DeLXFcoAsVU/",
                "token": token,
                "format_id": "1",
                "title": "Aditya Reel",
            },
        )
        assert resp.status_code == 200
        assert resp.headers.get("content-type") == "video/mp4"
        assert resp.headers.get("accept-ranges") == "bytes"
        cookies = resp.headers.get("set-cookie", "")
        assert f"truetube_dl_{token}=1" in cookies
        assert len(resp.content) > 0
