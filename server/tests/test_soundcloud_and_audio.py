import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.ytdlp_service import (
    YtDlpService,
    UnsupportedMediaSourceError,
    InvalidMediaUrlError,
)
from app.services.download_pipeline import download_pipeline
from app.models.schemas import DownloadJobRequest
from app.services.job_manager import Job
from pathlib import Path

client = TestClient(app)

def test_audio_only_source_normalization_no_dummy_video():
    """Verify that an audio-only source (SoundCloud) does not create fake video formats."""
    mock_soundcloud_info = {
        "title": "Low Fade",
        "thumbnail": "https://i1.sndcdn.com/artworks.jpg",
        "uploader": "Karan Aujla",
        "duration": 30,
        "view_count": 450000,
        "upload_date": "20260621",
        "formats": [
            {
                "format_id": "hls_mp3_1_0_preview",
                "vcodec": "none",
                "acodec": "mp3",
                "ext": "mp3",
                "abr": 128,
                "protocol": "m3u8_native",
                "filesize": 480000,
            },
            {
                "format_id": "http_mp3_1_0_preview",
                "vcodec": "none",
                "acodec": "mp3",
                "ext": "mp3",
                "abr": 128,
                "protocol": "http",
                "filesize": 480000,
            },
        ],
    }

    service = YtDlpService()
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_ydl = MagicMock()
        mock_ydl.extract_info.return_value = mock_soundcloud_info
        mock_ydl.__enter__.return_value = mock_ydl
        mock_ydl_cls.return_value = mock_ydl

        resp = service.extract_info("https://soundcloud.com/karanaujla-music/low-fade")

        assert resp.source_domain == "soundcloud.com"
        # Audio-only source must not have fake video formats
        assert len(resp.available_video_formats) == 0
        assert len(resp.formats) == 0
        assert "MP3" in resp.available_audio_formats
        assert len(resp.audio_streams) >= 1
        assert resp.audio_streams[0].format == "MP3"

def test_soundcloud_geo_restricted_error_handling():
    """Verify that geo-restricted tracks raise friendly UnsupportedMediaSourceError."""
    service = YtDlpService()
    import yt_dlp.utils

    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_ydl = MagicMock()
        mock_ydl.extract_info.side_effect = yt_dlp.utils.DownloadError(
            "ERROR: [soundcloud] This video is not available from your location due to geo restriction"
        )
        mock_ydl.__enter__.return_value = mock_ydl
        mock_ydl_cls.return_value = mock_ydl

        with pytest.raises(UnsupportedMediaSourceError) as exc_info:
            service.extract_info("https://soundcloud.com/aliciakeys/underdog")

        assert "geo-restriction" in str(exc_info.value).lower() or "region" in str(exc_info.value).lower()

def test_soundcloud_direct_stream_enforces_audio():
    """Verify direct_stream_download auto-detects soundcloud.com and uses audio extraction."""
    with patch("subprocess.Popen") as mock_popen:
        mock_proc = MagicMock()
        mock_proc.stdout.read.side_effect = [b"ID3\x03\x00\x00\x00", b""]
        mock_proc.poll.return_value = 0
        mock_popen.return_value = mock_proc

        response = client.get(
            "/api/download/direct",
            params={
                "url": "https://soundcloud.com/karanaujla-music/low-fade",
                "container": "mp4", # Client sent default MP4
                "audio_only": False, # Client sent default False
            },
        )

        assert response.status_code == 200
        # Headers must be audio/mpeg and .mp3 filename
        content_disp = response.headers.get("content-disposition", "")
        assert ".mp3" in content_disp
        assert "audio/" in response.headers.get("content-type", "")

        # Subprocess command must include -x (extract audio)
        called_cmd = mock_popen.call_args[0][0]
        assert "-x" in called_cmd
        assert "--audio-format" in called_cmd
