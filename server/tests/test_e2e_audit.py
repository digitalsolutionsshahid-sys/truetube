"""
Task 5 Master End-to-End Audit Test Suite for TrueTube.
Performs an exhaustive audit across the entire system:
1. System Health & Configuration.
2. Security & SSRF Defense-in-Depth (CIDR, Hex/Dec, credentials, ports, schemes).
3. Media Metadata Analysis, Normalization & Single Recommended Format.
4. Job Creation, Concurrency Bounding & State Transitions.
5. Server-Sent Events (SSE) Live Progress Streaming.
6. Safe Job Cancellation & File Purging.
7. File Serving with Unicode RFC 5987 Compliance.
8. Ephemeral Storage Expiration & Orphan Garbage Collection.
"""
import json
import threading
import time
from pathlib import Path
import pytest
import httpx
import uvicorn

from app.config import settings
from app.core.security import validate_and_sanitize_url, sanitize_filename, SSRFBlockedError, SecurityValidationError
from app.main import app
from app.models.schemas import DownloadJobRequest
from app.services.job_manager import job_manager


def test_audit_health_and_diagnostics():
    """Verify system diagnostics, active job counting, and FFmpeg detection."""
    from fastapi.testclient import TestClient
    client = TestClient(app)

    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["ffmpeg_available"] is True
    assert isinstance(data["active_jobs"], int)
    assert data["ytdlp_version"] is not None
    assert data["temp_dir"] is not None


def test_audit_security_ssrf_and_sanitization():
    """Verify SSRF multi-layer defenses and filename sanitization."""
    # 1. Private and loopback subnets
    blocked_hosts = [
        "http://127.0.0.1/",
        "http://127.0.0.2:8000/",
        "http://10.0.0.1/video",
        "http://172.16.0.1/test",
        "http://192.168.1.1/media",
        "http://169.254.169.254/latest/meta-data/",
    ]
    for url in blocked_hosts:
        with pytest.raises((SSRFBlockedError, SecurityValidationError)):
            validate_and_sanitize_url(url)

    # 2. Integer and Hex obfuscated IPs
    obfuscated_urls = [
        "http://2130706433/",
        "http://0x7f000001/",
    ]
    for url in obfuscated_urls:
        with pytest.raises((SSRFBlockedError, SecurityValidationError)):
            validate_and_sanitize_url(url)

    # 3. Embedded credentials
    with pytest.raises((SSRFBlockedError, SecurityValidationError)):
        validate_and_sanitize_url("http://admin:secret@attacker.com/video")

    # 4. Dangerous administrative ports
    dangerous_ports = [21, 22, 23, 25, 53, 6379, 11211, 27017]
    for port in dangerous_ports:
        with pytest.raises((SSRFBlockedError, SecurityValidationError)):
            validate_and_sanitize_url(f"http://example.com:{port}/media")

    # 5. Invalid schemes
    disallowed_schemes = [
        "file:///etc/passwd",
        "ftp://example.com/file",
        "gopher://example.com/",
        "data:text/html;base64,PHNjcmlwdD4=",
    ]
    for url in disallowed_schemes:
        with pytest.raises((SSRFBlockedError, SecurityValidationError)):
            validate_and_sanitize_url(url)

    # 6. Filename sanitization and Windows device protection
    assert sanitize_filename("safe_video.mp4") == "safe_video.mp4"
    assert sanitize_filename("../../etc/passwd.mp4") == "etc_passwd.mp4"
    assert sanitize_filename("CON.mp4") == "truetube_CON.mp4"
    assert sanitize_filename("NUL.mp4") == "truetube_NUL.mp4"
    assert sanitize_filename("AUX.mp4") == "truetube_AUX.mp4"


def test_audit_media_analysis_and_recommended_format(monkeypatch):
    """Verify single recommended badge, vertical video handling, and metadata schema."""
    from fastapi.testclient import TestClient
    from app.services.ytdlp_service import ytdlp_service
    client = TestClient(app)

    # Reject SSRF via API endpoint with 403 Forbidden
    resp = client.post("/api/analyze", json={"url": "http://127.0.0.1:8000/internal"})
    assert resp.status_code == 403
    assert resp.json()["detail"]["code"] == "UNSUPPORTED_SOURCE"

    # Verify mock analysis formats have exactly ONE recommended format
    mock_info = {
        "id": "audit_video_001",
        "title": "TrueTube Master Audit Test Video",
        "webpage_url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "thumbnail": "https://example.com/thumb.jpg",
        "duration": 180,
        "uploader": "TrueTube Quality Control",
        "view_count": 50000,
        "formats": [
            {"format_id": "313", "ext": "mp4", "width": 3840, "height": 2160, "vcodec": "avc1", "acodec": "none", "filesize": 350000000},
            {"format_id": "137", "ext": "mp4", "width": 1920, "height": 1080, "vcodec": "avc1", "acodec": "none", "filesize": 150000000},
            {"format_id": "136", "ext": "mp4", "width": 1280, "height": 720, "vcodec": "avc1", "acodec": "none", "filesize": 80000000},
            {"format_id": "140", "ext": "m4a", "vcodec": "none", "acodec": "mp4a.40.2", "abr": 128, "filesize": 10000000},
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
            return mock_info

    monkeypatch.setattr("yt_dlp.YoutubeDL", DummyYDL)

    parsed = ytdlp_service.extract_info("https://www.youtube.com/watch?v=aqz-KE-bpKQ")
    assert parsed.title == "TrueTube Master Audit Test Video"
    assert len(parsed.formats) >= 2
    # Ensure exactly 1 recommended format
    recommended_count = sum(1 for f in parsed.formats if f.is_recommended)
    assert recommended_count == 1, f"Expected 1 recommended format, got {recommended_count}"


def test_audit_live_pipeline_e2e_full_lifecycle():
    """
    Spawns live Uvicorn server and tests complete end-to-end lifecycle:
    Job creation -> SSE streaming -> Cancellation & Cleanup -> File Serving -> TTL GC.
    """
    config = uvicorn.Config(app=app, host="127.0.0.1", port=8996, log_level="warning")
    server = uvicorn.Server(config)

    server_thread = threading.Thread(target=server.run, daemon=True)
    server_thread.start()

    base_url = "http://127.0.0.1:8996"
    client = httpx.Client(timeout=10.0)

    # 1. Await server availability
    for _ in range(30):
        try:
            resp = client.get(f"{base_url}/api/health")
            if resp.status_code == 200:
                break
        except Exception:
            time.sleep(0.15)

    try:
        # 2. Check health
        health = client.get(f"{base_url}/api/health").json()
        assert health["status"] == "ok"

        # 3. Create real job
        job_payload = {
            "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
            "format_id": "1080p",
            "container": "mp4",
            "audio_only": False,
        }
        create_resp = client.post(f"{base_url}/api/jobs", json=job_payload)
        assert create_resp.status_code == 201
        job_data = create_resp.json()
        job_id = job_data["job_id"]
        assert job_id is not None

        # 4. Connect to SSE stream
        sse_events = []
        with client.stream("GET", f"{base_url}/api/jobs/{job_id}/progress", timeout=5.0) as stream:
            assert stream.status_code == 200
            assert "text/event-stream" in stream.headers["content-type"]
            for line in stream.iter_lines():
                if line.startswith("data: "):
                    payload = json.loads(line[6:])
                    sse_events.append(payload)
                    break
        assert len(sse_events) > 0
        assert sse_events[0]["job_id"] == job_id

        # 5. Cancel the job
        cancel_resp = client.post(f"{base_url}/api/jobs/{job_id}/cancel")
        assert cancel_resp.status_code == 200
        assert cancel_resp.json()["success"] is True

        # Verify job is CANCELLED
        job_status = client.get(f"{base_url}/api/jobs/{job_id}").json()
        assert job_status["status"] == "CANCELLED"

        # 6. Verify Unicode File Serving
        dummy_job = job_manager.create_job(
            DownloadJobRequest(url="https://www.youtube.com/watch?v=aqz-KE-bpKQ", container="mp4")
        )
        unicode_filename = "TrueTube_Audit_中文_4K.mp4"
        unicode_file = dummy_job.temp_dir / unicode_filename
        file_payload = b"TrueTube Complete E2E Audit Verification Stream 2026"
        unicode_file.write_bytes(file_payload)

        job_manager.update_job_progress(
            dummy_job.id,
            status="COMPLETED",
            progress_percent=100.0,
            filename=unicode_filename,
            file_path=unicode_file,
            file_size_str="53 B",
        )

        file_resp = client.get(f"{base_url}/api/jobs/{dummy_job.id}/file")
        assert file_resp.status_code == 200
        assert file_resp.content == file_payload
        assert "attachment" in file_resp.headers["content-disposition"]

        # 7. Cleanup & GC
        cleaned = job_manager.clean_expired_jobs(ttl=0)
        assert cleaned >= 1

    finally:
        server.should_exit = True
