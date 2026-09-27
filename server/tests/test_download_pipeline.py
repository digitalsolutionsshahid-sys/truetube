import os
import time
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app
from app.models.schemas import DownloadJobRequest
from app.services.job_manager import job_manager

client = TestClient(app)

def test_create_and_query_job():
    response = client.post(
        "/api/jobs",
        json={
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "resolution": "720p",
            "container": "mp4",
            "audio_only": False,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "job_id" in data
    assert data["status"] in ("QUEUED", "ANALYZING", "DOWNLOADING")

    job_id = data["job_id"]
    query_resp = client.get(f"/api/jobs/{job_id}")
    assert query_resp.status_code == 200
    assert query_resp.json()["job_id"] == job_id

def test_job_not_found():
    response = client.get("/api/jobs/non-existent-uuid-12345")
    assert response.status_code == 404

def test_cancel_job():
    # Create job
    create_resp = client.post(
        "/api/jobs",
        json={
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "container": "mp4",
        },
    )
    assert create_resp.status_code == 201
    job_id = create_resp.json()["job_id"]

    # Cancel immediately
    cancel_resp = client.post(f"/api/jobs/{job_id}/cancel")
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["success"] is True

    # Verify status is CANCELLED
    status_resp = client.get(f"/api/jobs/{job_id}")
    assert status_resp.json()["status"] == "CANCELLED"

def test_file_download_endpoint_lifecycle():
    req = DownloadJobRequest(
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        container="mp4",
    )
    job = job_manager.create_job(req)

    # 1. Attempting download before completed returns 400
    bad_resp = client.get(f"/api/jobs/{job.id}/file")
    assert bad_resp.status_code == 400

    # 2. Simulate completed file
    dummy_file = job.temp_dir / "Test_Video.mp4"
    dummy_file.write_bytes(b"Simulated MP4 video file header content for TrueTube testing")

    job_manager.update_job_progress(
        job.id,
        status="COMPLETED",
        progress_percent=100.0,
        filename="Test_Video.mp4",
        file_path=dummy_file,
        file_size_str="58 B",
    )

    # 3. Retrieve completed file
    good_resp = client.get(f"/api/jobs/{job.id}/file")
    assert good_resp.status_code == 200
    assert good_resp.headers["content-type"] == "video/mp4"
    assert "attachment" in good_resp.headers["content-disposition"]
    assert good_resp.content == b"Simulated MP4 video file header content for TrueTube testing"

def test_sse_progress_stream_handshake():
    req = DownloadJobRequest(
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        container="mp4",
    )
    job = job_manager.create_job(req)
    job_manager.update_job_progress(job.id, status="COMPLETED", progress_percent=100.0)

    # Test SSE connection
    with client.stream("GET", f"/api/jobs/{job.id}/progress") as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        received = False
        for line in response.iter_lines():
            if line.startswith("data: "):
                assert "job_id" in line
                received = True
                break
        assert received is True

def test_download_file_with_unicode_characters():
    """Verify that international and Unicode filenames serve cleanly without UnicodeEncodeError."""
    req = DownloadJobRequest(
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        container="mp4",
    )
    job = job_manager.create_job(req)
    unicode_file = job.temp_dir / "测试视频_动画_4K.mp4"
    unicode_file.write_bytes(b"Unicode test content for TrueTube")

    job_manager.update_job_progress(
        job.id,
        status="COMPLETED",
        progress_percent=100.0,
        filename="测试视频_动画_4K.mp4",
        file_path=unicode_file,
        file_size_str="33 B",
    )

    resp = client.get(f"/api/jobs/{job.id}/file")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "video/mp4"
    # Content-Disposition should contain encoded or compliant filename
    assert "attachment" in resp.headers["content-disposition"]
    assert resp.content == b"Unicode test content for TrueTube"

def test_ydl_options_format_resolution_and_audio():
    """Verify yt-dlp format and postprocessor building across resolutions and audio extractors."""
    from app.services.download_pipeline import download_pipeline

    # 1. Shorthand resolution format
    req1 = DownloadJobRequest(
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        format_id="1080p",
        container="mp4",
    )
    job1 = job_manager.create_job(req1)
    opts1 = download_pipeline._build_ydl_opts(job1)
    assert "height<=1080" in opts1["format"]
    assert opts1["merge_output_format"] == "mp4"

    # 2. Audio only mode
    req2 = DownloadJobRequest(
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        audio_only=True,
        container="mp3",
        audio_stream_id="audio_140",
    )
    job2 = job_manager.create_job(req2)
    opts2 = download_pipeline._build_ydl_opts(job2)
    assert "140" in opts2["format"]
    pp_keys = [p["key"] for p in opts2["postprocessors"]]
    assert "FFmpegExtractAudio" in pp_keys

    # 3. Embed thumbnail with converter
    req3 = DownloadJobRequest(
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        embed_thumbnail=True,
        container="mp4",
    )
    job3 = job_manager.create_job(req3)
    opts3 = download_pipeline._build_ydl_opts(job3)
    if settings.FFMPEG_PATH:
        assert opts3.get("writethumbnail") is True
        pp_keys3 = [p["key"] for p in opts3["postprocessors"]]
        assert "FFmpegThumbnailsConvertor" in pp_keys3
        assert "EmbedThumbnail" in pp_keys3

def test_clean_expired_jobs_purges_memory_and_disk():
    """Verify clean_expired_jobs purges expired in-memory jobs and disk orphan folders."""
    req = DownloadJobRequest(
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        container="mp4",
    )
    job = job_manager.create_job(req)
    assert job.temp_dir.exists()

    # Create dummy orphan dir in temp storage
    orphan_dir = settings.TEMP_STORAGE_PATH / "orphan_test_dir_12345"
    orphan_dir.mkdir(parents=True, exist_ok=True)
    assert orphan_dir.exists()

    # Artificially set job updated_at to the past
    job.updated_at = time.time() - 7200

    # Run cleanup with ttl=3600
    cleaned = job_manager.clean_expired_jobs(ttl=3600)
    assert cleaned >= 1
    assert job_manager.get_job(job.id) is None
    assert not job.temp_dir.exists()

    # Clean with ttl=0 to purge orphan dir
    job_manager.clean_expired_jobs(ttl=0)
    assert not orphan_dir.exists()

def test_concurrency_limit_for_jobs():
    """Verify HTTP 429 when max concurrent download jobs is exceeded."""
    from unittest.mock import patch

    # Mock get_active_job_count returning MAX_CONCURRENT_JOBS
    with patch.object(job_manager, "get_active_job_count", return_value=settings.MAX_CONCURRENT_JOBS):
        resp = client.post(
            "/api/jobs",
            json={
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "container": "mp4",
            },
        )
        assert resp.status_code == 429
        assert "limit reached" in resp.json()["detail"]["error"]


def test_float_byte_counts_validation_immunity():
    """Verify that float estimates from yt-dlp (e.g. 30408623.999999996) do not crash Pydantic validation."""
    req = DownloadJobRequest(url="https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    job = job_manager.create_job(req)

    # Pass float byte counts as received from yt-dlp fragmented streams
    job_manager.update_job_progress(
        job.id,
        status="DOWNLOADING",
        progress_percent=45.5,
        downloaded_bytes=1048576.75,  # float with fractional part
        total_bytes=30408623.999999996,  # float with fractional part
    )

    resp = job.to_response()
    assert isinstance(resp.total_bytes, int)
    assert resp.total_bytes == 30408624
    assert isinstance(resp.downloaded_bytes, int)
    assert resp.downloaded_bytes == 1048577

def test_direct_stream_download_validations():
    """Verify that /api/download/direct rejects SSRF and invalid URLs before processing."""
    # SSRF test
    resp_ssrf = client.get("/api/download/direct?url=http://127.0.0.1:8000/secret")
    assert resp_ssrf.status_code == 403

    # Invalid URL test
    resp_inv = client.get("/api/download/direct?url=ftp://invalid-url.com")
    assert resp_inv.status_code == 400



