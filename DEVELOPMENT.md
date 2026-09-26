# TrueTube Developer Guide

This guide covers setting up your local development environment, project directory organization, testing practices, and engineering workflows.

---

## 1. Prerequisites

Before getting started, make sure you have the following installed:

1. **Python**: Version 3.10 or higher (Python 3.14 tested and supported).
2. **Node.js**: Version 18.0.0 or higher (Node 20 LTS recommended).
3. **FFmpeg & FFprobe**: Version 6.0 or higher (FFmpeg 8.1.1 tested and supported).
   - **Windows**: Install via `winget install Gyan.FFmpeg` or download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/).
   - **macOS**: Install via Homebrew: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt update && sudo apt install ffmpeg`
   - Ensure `ffmpeg -version` and `ffprobe -version` succeed in your terminal.

---

## 2. Directory Layout

```
.
├── client/                      # React 19 + TypeScript frontend
│   ├── src/
│   │   ├── components/          # UI components (7 interactive states)
│   │   │   ├── AdvancedOptionsDrawer.tsx
│   │   │   ├── AnalyzingState.tsx
│   │   │   ├── CompletedState.tsx
│   │   │   ├── DownloadProgress.tsx
│   │   │   ├── ErrorCard.tsx
│   │   │   ├── FeatureSections.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── FormatSelector.tsx
│   │   │   ├── Header.tsx (Navbar.tsx)
│   │   │   ├── HeroInput.tsx
│   │   │   ├── MediaPreview.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── RecentDownloads.tsx
│   │   │   └── Toast.tsx
│   │   ├── services/
│   │   │   └── api.ts           # Typed API client + SSE EventSource listener
│   │   ├── types/
│   │   │   └── media.ts         # TypeScript interfaces for formats & jobs
│   │   ├── App.tsx              # Central state machine orchestrator
│   │   └── main.tsx             # Application bootstrap
│   ├── package.json
│   ├── vite.config.ts           # Vite config with /api proxy to FastAPI
│   └── tsconfig.json
│
├── server/                      # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py        # REST endpoints and SSE streaming handler
│   │   ├── core/
│   │   │   └── security.py      # SSRF protection, IP/port filtering, filename sanitizer
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic v2 schemas for requests & responses
│   │   ├── services/
│   │   │   ├── download_pipeline.py # yt-dlp & FFmpeg asynchronous execution pipeline
│   │   │   ├── job_manager.py       # Thread-safe job state machine & event dispatcher
│   │   │   └── ytdlp_service.py     # Native yt-dlp metadata extraction
│   │   ├── config.py            # Environment configuration & settings
│   │   └── main.py              # FastAPI app instance, CORS, logging, & lifespan hooks
│   ├── storage/
│   │   └── temp/                # Ephemeral directories for active downloads
│   ├── tests/                   # Pytest automated test suite (30 tests)
│   │   ├── test_analyzer.py
│   │   ├── test_download_pipeline.py
│   │   ├── test_live_download_pipeline.py
│   │   ├── test_e2e_audit.py
│   │   └── live_test.py
│   ├── pyproject.toml
│   └── requirements.txt
│
├── .env.example                 # Root configuration template
├── README.md                    # Primary project overview
├── ARCHITECTURE.md              # Detailed system architecture
├── API.md                       # API specifications
├── DEVELOPMENT.md               # This guide
├── DEPLOYMENT.md                # Production Docker & deployment guide
├── SECURITY.md                  # Security model & threat analysis
└── REVIEWS.md                   # Task verification records & review certifications
```

---

## 3. Backend Development Setup

### 3.1 Python Virtual Environment
Navigate to the `server/` directory and configure your virtual environment:

```bash
cd server
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On macOS/Linux:
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

### 3.2 Running the Backend Tests
Run the full pytest suite:

```bash
python -m pytest tests/ -v -o pythonpath=.
```

To run a specific test file:
```bash
python -m pytest tests/test_analyzer.py -v -o pythonpath=.
```

### 3.3 Starting the Backend Server
Start the development server with live reload:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base: `http://127.0.0.1:8000`
- Swagger UI Documentation: `http://127.0.0.1:8000/docs`
- Redoc Documentation: `http://127.0.0.1:8000/redoc`

---

## 4. Frontend Development Setup

### 4.1 Node Modules
In a separate terminal, navigate to `client/`:

```bash
cd client
npm install
```

### 4.2 Starting the Vite Dev Server
```bash
npm run dev
```

- Client Application: `http://localhost:5173`
- The Vite development server automatically forwards all `/api/*` HTTP and SSE requests to `http://127.0.0.1:8000` via the proxy defined in `vite.config.ts`.

### 4.3 Building & Linting
Verify production TypeScript compilation:
```bash
npm run build
```

Run Oxlint:
```bash
npm run lint
```

---

## 5. Key Engineering Practices

### 5.1 Native yt-dlp In-Process Usage
**Never** execute yt-dlp via `subprocess.run(["yt-dlp", ...])` or shell strings. TrueTube uses the official Python API:
```python
import yt_dlp

ydl_opts = {
    "quiet": True,
    "no_warnings": True,
    "skip_download": True,
    "socket_timeout": 15,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(url, download=False)
```
This eliminates shell injection vectors and allows direct access to parsed stream dictionaries.

### 5.2 Thread-Safe SSE Streaming
When updating progress from background `ThreadPoolExecutor` workers, always dispatch to the event loop thread-safely:
```python
# In job_manager.py:
def _dispatch_to_listener(loop, queue, data):
    if loop and loop.is_running():
        loop.call_soon_threadsafe(queue.put_nowait, data)
    else:
        queue.put_nowait(data)
```

### 5.3 Temporary File Cleanup
Always use `safe_rmtree` from [job_manager.py](file:///c:/Users/aDmin/Documents/Yt%20Download%20website/server/app/services/job_manager.py) when removing directories:
- Handles Windows read-only flags (`stat.S_IWRITE`).
- Implements transient lock retries for file indexing services.
