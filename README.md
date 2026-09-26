# TrueTube

> **A modern, production-grade media downloading and processing platform powered by yt-dlp and FFmpeg.**

TrueTube is a full-stack media platform engineered for high performance, reliability, and security. Unlike toy downloaders or mock interfaces, TrueTube is a genuinely functional system: users submit supported media URLs, inspect streams and formats, customize extraction parameters, monitor live download pipelines via Server-Sent Events (SSE), and download merged, high-definition media files.

---

## Key Capabilities

- **Real Engine Core**: Powered directly by native Python `yt_dlp` and `FFmpeg` 8.1.1 stream merging.
- **Full Resolution Spectrum**: Automatic discovery of 4K (2160p), 1440p, 1080p Full HD, 720p HD, 480p, 360p, and vertical short-form resolutions (YouTube Shorts, TikTok, Instagram Reels).
- **High-Fidelity Audio Extraction**: Native extraction to MP3 (up to 320 kbps), AAC/M4A, WAV (lossless), and Opus with multi-track audio stream selection.
- **Advanced Processing Suite**:
  - Embedded subtitles (multilingual VTT/SRT).
  - Embedded metadata (artist, title, album, upload date, chapters).
  - High-resolution thumbnail embedding.
  - Custom filename templating.
- **Real-Time Pipeline Telemetry**: Server-Sent Events (SSE) streaming live byte-level progress, download speed, ETA, and a 5-stage processing timeline (`Queued` → `Analyzing` → `Downloading` → `Processing/Merging` → `Finalizing`).
- **Resilient State Management**: Active job tracking, client-initiated cancellation with immediate thread abort, and automated background directory cleanup.
- **Multi-Layer Defense-in-Depth**:
  - Strict SSRF protection blocking IPv4/IPv6 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`).
  - Detection and rejection of integer/hex obfuscated IP addresses.
  - Port validation blocking dangerous internal services (SSH, Telnet, SMTP, Redis, Memcached).
  - Filename sanitization preventing path traversal and Windows reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`).
  - Thread-safe bounded concurrency limiting server load.
- **Stitch Visual Fidelity**: Built against the dark cyber-minimalist design specification: `#07090E` base, `#0D111D` card surfaces, `#1E293B` borders, electric indigo/violet glowing accents (`#6366F1`, `#8B5CF6`), and Inter typography.
- **WCAG 2.1 AA Accessible**: Fully keyboard-navigable (`Tab`, `Space`, `Enter`), semantic radio groups, ARIA live regions, switch roles, and focus-visible rings.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 Client (React 19 + Vite)                    │
│   Tailwind CSS v4 • Lucide Icons • SSE Streaming Client     │
└──────────────┬───────────────────────────────▲──────────────┘
               │                               │
         REST Requests                    SSE Progress
      (POST /api/analyze)             (GET /api/jobs/{id}/progress)
      (POST /api/jobs)                         │
               │                               │
┌──────────────▼───────────────────────────────┴──────────────┐
│                    TrueTube Backend                         │
│               FastAPI (Python 3.14 Async)                   │
├─────────────────────────────────────────────────────────────┤
│  Security Layer: SSRF Filter, Port Filter, Name Sanitizer   │
├─────────────────────────────────────────────────────────────┤
│  Job Manager: Thread-Safe State Machine & Event Queues      │
├─────────────────────────────────────────────────────────────┤
│  Download Pipeline: ThreadPoolExecutor + yt-dlp + FFmpeg    │
├─────────────────────────────────────────────────────────────┤
│  Storage Manager: Isolated Job Temp Dirs & Auto-TTL Purge   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Domain | Technology | Version / Details |
|---|---|---|
| **Frontend Framework** | React | 19.x (TypeScript 5.9) |
| **Frontend Tooling** | Vite | 8.3 |
| **Styling** | Tailwind CSS | 4.x (Cyber-minimalist dark palette) |
| **Icons** | Lucide React | 1.16+ |
| **Backend Framework** | FastAPI / Starlette | 0.135+ (Python 3.14) |
| **Server Runtime** | Uvicorn | ASGI Server |
| **Media Engine** | yt-dlp | 2026.08.19 native Python API |
| **Media Transcoder** | FFmpeg / FFprobe | 8.1.1 full build with libmp3lame, libopus |
| **Test Suites** | Pytest / AnyIO | 26 unit & live integration tests |
| **Code Quality** | Oxlint / ESLint / Mypy | Zero warnings, zero errors |

---

## 7 Interactive User States

TrueTube models the media extraction lifecycle through 7 discrete states:

1. **Hero / URL Input (`IDLE`)**: Clean glowing input container with paste-from-clipboard detection, platform chips (YouTube, TikTok, Vimeo, Twitter, SoundCloud), and feature highlights.
2. **State 1: Analyzing (`ANALYZING`)**: Pulsing radar glow spinner with a 3-stage animated verification checklist (*Connecting to media source*, *Extracting audio/video streams*, *Resolving format matrices*).
3. **State 2: Media Preview (`FORMAT_SELECTION` - Header)**: High-resolution media thumbnail with duration badge, verified channel pill, view counts, and video specs card.
4. **State 3: Format Selector (`FORMAT_SELECTION`)**: Video/Audio tabbed switcher, radio format cards (MP4, WebM, MP3, M4A, WAV), quality tiers with calculated sizes, multi-track audio selector, and direct download triggers.
5. **State 4: Downloading (`DOWNLOADING`)**: Real-time progress bar with animated indigo-violet glow, byte-level transferred counters, download speed, ETA calculation, 5-stage breadcrumb timeline, and cancellation action.
6. **State 5: Completed (`COMPLETED`)**: Emerald success badge, final media summary card, direct file download CTA, and quick "Download Another" action.
7. **State 6: Advanced Options (`DRAWER`)**: Slide-over drawer controlling audio extraction only, subtitle languages, metadata tagging, thumbnail injection, filename templates, and container defaults.
8. **State 7: Recent Downloads (`RECENT_DOWNLOADS`)**: LocalStorage-persisted history with relative timestamps, file size badges, and quick re-download triggers.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.10 or higher (tested on v3.14)
- **FFmpeg**: Installed and available in your system `PATH` (or specified via `TRUETUBE_FFMPEG_PATH`)

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/truetube.git
cd truetube
cp .env.example .env
```

### 2. Backend Setup

```bash
cd server
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
```

Verify backend installation:
```bash
python -m pytest tests/ -v -o pythonpath=.
```

Start the FastAPI server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation is accessible at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup

In a new terminal:
```bash
cd client
npm install
npm run build
npm run dev
```

The TrueTube web application will launch at `http://localhost:5173`. Vite is preconfigured with a development proxy that routes `/api/*` directly to `http://127.0.0.1:8000`.

---

## Configuration Variables

TrueTube supports granular configuration via environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `TRUETUBE_HOST` | `127.0.0.1` | API binding address |
| `TRUETUBE_PORT` | `8000` | API port |
| `TRUETUBE_DEBUG` | `False` | Enable debug mode and extended tracebacks |
| `TRUETUBE_ALLOWED_ORIGINS` | `["http://localhost:5173", ...]` | CORS permitted origin URLs |
| `TRUETUBE_MAX_CONCURRENT_JOBS`| `3` | Max simultaneous download/transcode pipelines |
| `TRUETUBE_MAX_CONCURRENT_ANALYSES`| `5` | Max simultaneous yt-dlp metadata extractions |
| `TRUETUBE_TEMP_STORAGE_PATH`| `./storage/temp` | Directory where active jobs assemble media |
| `TRUETUBE_FILE_EXPIRATION_SECONDS`| `3600` (1 hour) | Retention TTL for completed files |
| `TRUETUBE_FFMPEG_PATH` | System `PATH` | Custom path to `ffmpeg` binary |
| `TRUETUBE_ALLOW_PRIVATE_IPS` | `False` | **NEVER enable in production** (SSRF bypass) |

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Validates URL, extracts metadata, formats, and available streams |
| `GET` | `/api/health` | System health, FFmpeg status, and active job counts |
| `POST` | `/api/jobs` | Enqueues a real media download/transcode pipeline |
| `GET` | `/api/jobs/{id}` | Queries current status and progress metadata for a job |
| `GET` | `/api/jobs/{id}/progress` | Server-Sent Events (SSE) live progress stream |
| `POST` | `/api/jobs/{id}/cancel` | Aborts an active pipeline and purges intermediate files |
| `GET` | `/api/jobs/{id}/file` | Serves the finalized media file (RFC 5987 Unicode safe) |

See [API.md](API.md) for full endpoint specifications, request payloads, and status codes.

---

## Testing & Quality Assurance

TrueTube includes a comprehensive suite of automated tests:

```bash
# Run backend test suite (26 unit and live integration tests)
cd server
python -m pytest tests/ -v -o pythonpath=.

# Run frontend type checking & build verification
cd ../client
npm run build

# Run frontend code linter
npm run lint
```

---

## Project Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — Detailed system design, data flows, and concurrency architecture.
- [API.md](API.md) — Comprehensive REST & Server-Sent Events API specifications.
- [DEVELOPMENT.md](DEVELOPMENT.md) — Local developer setup, workflows, and debugging guides.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Production Docker, Nginx, and cloud deployment guides.
- [SECURITY.md](SECURITY.md) — Security model, SSRF defenses, and input sanitization policies.
- [REVIEWS.md](REVIEWS.md) — Milestone audit history and review agent certifications.

---

## Legal & Compliance

TrueTube is an open-source software project designed for personal media backups, creator workflows, and archival of royalty-free or public domain media. Users are responsible for complying with the terms of service of any third-party platforms accessed and all applicable local copyright laws.
