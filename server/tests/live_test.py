"""
Live API Endpoints Integration Test for TrueTube Task 2.
Spawns live Uvicorn server in a separate thread and makes real HTTP network requests.
"""
import time
import threading
import httpx
import uvicorn
import os
import sys
from pathlib import Path

# Add server root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app

def run_server(server: uvicorn.Server):
    server.run()

def test_live_api():
    config = uvicorn.Config(app=app, host="127.0.0.1", port=8999, log_level="warning")
    server = uvicorn.Server(config)
    
    server_thread = threading.Thread(target=run_server, args=(server,), daemon=True)
    server_thread.start()
    
    # Wait for server to start
    base_url = "http://127.0.0.1:8999"
    max_retries = 20
    client = httpx.Client(timeout=5.0)
    
    started = False
    for _ in range(max_retries):
        try:
            resp = client.get(f"{base_url}/api/health")
            if resp.status_code == 200:
                started = True
                break
        except Exception:
            time.sleep(0.2)
            
    assert started, "Server failed to start within timeout"
    print("[OK] Live server successfully started on port 8999")

    try:
        # 1. Test GET / (Serves Frontend SPA index.html or JSON status)
        resp = client.get(f"{base_url}/")
        print(f"GET / -> Status: {resp.status_code}, Content-Type: {resp.headers.get('content-type')}")
        assert resp.status_code == 200
        assert "<!doctype html>" in resp.text.lower() or resp.json().get("status") == "online"

        # 2. Test GET /api/health
        resp = client.get(f"{base_url}/api/health")
        data = resp.json()
        print(f"GET /api/health -> Status: {resp.status_code}, Body: {data}")
        assert resp.status_code == 200
        assert data["status"] == "ok"
        assert data["ffmpeg_available"] is True
        assert len(data["ffmpeg_path"]) > 0
        assert data["active_jobs"] == 0

        # 3. Test SSRF loopback block
        resp = client.post(f"{base_url}/api/analyze", json={"url": "http://127.0.0.1:8999/api/health"})
        print(f"POST /api/analyze (SSRF loopback) -> Status: {resp.status_code}, Detail: {resp.json()}")
        assert resp.status_code == 403
        assert resp.json()["detail"]["code"] == "UNSUPPORTED_SOURCE"

        # 4. Test SSRF integer IP block
        resp = client.post(f"{base_url}/api/analyze", json={"url": "http://2130706433/"})
        print(f"POST /api/analyze (SSRF int IP) -> Status: {resp.status_code}, Detail: {resp.json()}")
        assert resp.status_code == 403
        assert resp.json()["detail"]["code"] == "UNSUPPORTED_SOURCE"

        # 5. Test Embedded Credentials block
        resp = client.post(f"{base_url}/api/analyze", json={"url": "http://admin:secret@youtube.com/watch?v=123"})
        print(f"POST /api/analyze (Credentials) -> Status: {resp.status_code}, Detail: {resp.json()}")
        assert resp.status_code == 400
        assert resp.json()["detail"]["code"] == "INVALID_URL"

        # 6. Test Dangerous Port block
        resp = client.post(f"{base_url}/api/analyze", json={"url": "http://example.com:22/video.mp4"})
        print(f"POST /api/analyze (Port 22) -> Status: {resp.status_code}, Detail: {resp.json()}")
        assert resp.status_code == 400
        assert resp.json()["detail"]["code"] == "INVALID_URL"

        # 7. Test Disallowed scheme
        resp = client.post(f"{base_url}/api/analyze", json={"url": "file:///C:/Windows/win.ini"})
        print(f"POST /api/analyze (File scheme) -> Status: {resp.status_code}, Detail: {resp.json()}")
        assert resp.status_code == 400
        assert resp.json()["detail"]["code"] == "INVALID_URL"

        # 8. Test Empty URL
        resp = client.post(f"{base_url}/api/analyze", json={"url": "   "})
        print(f"POST /api/analyze (Empty URL) -> Status: {resp.status_code}")
        assert resp.status_code in (400, 422)

        print("\nALL LIVE API TESTS PASSED SUCCESSFULLY!")

    finally:
        server.should_exit = True

if __name__ == "__main__":
    test_live_api()
