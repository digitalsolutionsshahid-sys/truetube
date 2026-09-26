"""
Live End-to-End Download Pipeline & Job Lifecycle Test for TrueTube Task 3.
Spawns live Uvicorn server in a separate thread and makes real HTTP network requests
verifying job creation, SSE streaming, cancellation, cleanup, and file serving.
"""
import json
import os
import sys
import threading
import time
from pathlib import Path

import httpx
import uvicorn

# Add server root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.main import app
from app.models.schemas import DownloadJobRequest
from app.services.job_manager import job_manager

def run_server(server: uvicorn.Server):
    server.run()

def test_live_download_pipeline_e2e():
    config = uvicorn.Config(app=app, host="127.0.0.1", port=8997, log_level="warning")
    server = uvicorn.Server(config)

    server_thread = threading.Thread(target=run_server, args=(server,), daemon=True)
    server_thread.start()

    base_url = "http://127.0.0.1:8997"
    client = httpx.Client(timeout=10.0)

    # 1. Wait for server startup
    started = False
    for _ in range(25):
        try:
            resp = client.get(f"{base_url}/api/health")
            if resp.status_code == 200:
                started = True
                break
        except Exception:
            time.sleep(0.2)

    assert started, "Server failed to start within timeout"
    print("[PASS] 1. Live server started on http://127.0.0.1:8997")

    try:
        # 2. Check health endpoint reports active jobs
        health_resp = client.get(f"{base_url}/api/health")
        assert health_resp.status_code == 200
        health_data = health_resp.json()
        assert health_data["status"] == "ok"
        assert health_data["ffmpeg_available"] is True
        print(f"[PASS] 2. Health check OK (active jobs: {health_data['active_jobs']})")

        # 3. Create real job via POST /api/jobs
        create_payload = {
            "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
            "format_id": "720p",
            "container": "mp4",
            "audio_only": False,
        }
        create_resp = client.post(f"{base_url}/api/jobs", json=create_payload)
        assert create_resp.status_code == 201, f"Expected 201, got {create_resp.status_code}: {create_resp.text}"
        job_data = create_resp.json()
        job_id = job_data["job_id"]
        assert job_id is not None
        assert job_data["status"] in ("QUEUED", "ANALYZING", "DOWNLOADING")
        print(f"[PASS] 3. Job created: {job_id} (status: {job_data['status']})")

        # 4. Stream progress via SSE GET /api/jobs/{id}/progress
        events_received = []
        with client.stream("GET", f"{base_url}/api/jobs/{job_id}/progress", timeout=5.0) as sse_stream:
            assert sse_stream.status_code == 200
            assert "text/event-stream" in sse_stream.headers["content-type"]
            for line in sse_stream.iter_lines():
                if line.startswith("data: "):
                    payload = json.loads(line[6:])
                    events_received.append(payload)
                    break  # Got initial event stream handshake
        assert len(events_received) > 0
        assert events_received[0]["job_id"] == job_id
        print(f"[PASS] 4. SSE live stream handshake OK (received stage: {events_received[0]['current_stage']})")

        # 5. Cancel active job and verify cancellation & cleanup
        cancel_resp = client.post(f"{base_url}/api/jobs/{job_id}/cancel")
        assert cancel_resp.status_code == 200
        assert cancel_resp.json()["success"] is True

        # Check job status is CANCELLED
        status_resp = client.get(f"{base_url}/api/jobs/{job_id}")
        assert status_resp.status_code == 200
        assert status_resp.json()["status"] == "CANCELLED"
        print(f"[PASS] 5. Job cancelled cleanly and marked CANCELLED")

        # 6. Verify File Serving endpoint with Unicode sanitized filenames
        file_job = job_manager.create_job(
            DownloadJobRequest(
                url="https://www.youtube.com/watch?v=aqz-KE-bpKQ",
                container="mp4",
            )
        )
        test_file = file_job.temp_dir / "Big_Buck_Bunny_4K_高清.mp4"
        test_content = b"TrueTube Live Media Download Stream Content Header 2026"
        test_file.write_bytes(test_content)

        job_manager.update_job_progress(
            file_job.id,
            status="COMPLETED",
            progress_percent=100.0,
            filename=test_file.name,
            file_path=test_file,
            file_size_str="56 B",
        )

        file_resp = client.get(f"{base_url}/api/jobs/{file_job.id}/file")
        assert file_resp.status_code == 200
        assert file_resp.headers["content-type"] == "video/mp4"
        assert "attachment" in file_resp.headers["content-disposition"]
        assert file_resp.content == test_content
        print(f"[PASS] 6. Completed file serving with Unicode filename: {test_file.name.encode('ascii', 'replace').decode('ascii')} served successfully")

        # 7. Check 404 for non-existent job and file
        not_found_resp = client.get(f"{base_url}/api/jobs/non-existent-job-xyz")
        assert not_found_resp.status_code == 404
        not_found_file = client.get(f"{base_url}/api/jobs/non-existent-job-xyz/file")
        assert not_found_file.status_code == 404
        print("[PASS] 7. Error handling for non-existent jobs returned 404")

        # 8. Test clean_expired_jobs cleanup
        cleaned = job_manager.clean_expired_jobs(ttl=0)
        assert cleaned >= 1
        print(f"[PASS] 8. Expired job directories successfully cleaned up ({cleaned} items)")

        print("\n=======================================================")
        print("ALL LIVE END-TO-END DOWNLOAD PIPELINE TESTS PASSED!")
        print("=======================================================")

    finally:
        server.should_exit = True

if __name__ == "__main__":
    test_live_download_pipeline_e2e()
