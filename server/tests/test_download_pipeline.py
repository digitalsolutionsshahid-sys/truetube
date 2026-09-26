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
