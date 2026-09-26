# TrueTube Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade full-stack media downloading web application (TrueTube) powered by yt-dlp and FFmpeg, faithfully recreating the dark cyber-minimalist visual design from the Stitch reference.

**Architecture:** Frontend built with Vite, React 19, TypeScript, and Tailwind CSS implementing all 7 visual states from the Stitch mockup. Backend built with Python 3.14, FastAPI, native `yt-dlp` library, and FFmpeg 8.1.1, featuring asynchronous job queuing, Server-Sent Events (SSE) for zero-latency progress updates, safe cancellation, and controlled file storage lifecycles.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Python 3.14, FastAPI, Uvicorn, yt-dlp 2026.08.19, FFmpeg 8.1.1, Pytest.

**Spec:** [docs/superpowers/specs/2026-09-27-truetube-design.md](file:///c:/Users/aDmin/Documents/Yt%20Download%20website/docs/superpowers/specs/2026-09-27-truetube-design.md)

## Global Constraints
- Faithful alignment with the Stitch reference design (`media_1790459927625.jpg`): deep navy/black theme, electric violet/indigo accents (`#6366F1`, `#8B5CF6`), subtle glow, sleek cards, and Inter typography.
- Real yt-dlp integration: no simulated downloads, no dummy metadata, no fake progress bars.
- Safe process management: native Python `yt_dlp` integration with zero raw shell command execution.
- Security-first: URL scheme whitelisting, SSRF protection against private network ranges, path sanitization, bounded storage.
- Exactly FIVE development tasks with dedicated Review Agent verification after each task.

## Review Focus
1. Malformed or private IP URLs (SSRF prevention) rejected before touching yt-dlp.
2. Sudden network disconnection or mid-download job cancellation cleanly terminating the thread and purging disk artifacts.
3. Audio-only conversion gracefully extracting MP3/M4A/WAV via FFmpeg without stream corruption.
4. Mobile viewport rendering without horizontal overflow across all 7 UI states.
5. High-resolution format selection dynamically presenting only formats actually returned by yt-dlp.

---

### Task 1: Foundation + Visual Implementation (Stitch Fidelity)

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.ts`
- Create: `client/tsconfig.json`
- Create: `client/tailwind.config.js`
- Create: `client/src/index.css`
- Create: `client/src/types/media.ts`
- Create: `client/src/components/Navbar.tsx`
- Create: `client/src/components/HeroInput.tsx`
- Create: `client/src/components/AnalyzingState.tsx`
- Create: `client/src/components/MediaPreview.tsx`
- Create: `client/src/components/FormatSelector.tsx`
- Create: `client/src/components/DownloadingState.tsx`
- Create: `client/src/components/CompletedState.tsx`
- Create: `client/src/components/AdvancedOptionsDrawer.tsx`
- Create: `client/src/components/RecentDownloads.tsx`
- Create: `client/src/components/ErrorCards.tsx`
- Create: `client/src/components/FeatureSections.tsx`
- Create: `client/src/components/Footer.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/mockData.ts`

**Interfaces:**
- Produces: `MediaMetadata`, `MediaFormat`, `AudioFormat`, `DownloadJobState`, `AdvancedOptionsConfig`.

- [ ] **Step 1: Scaffold Vite + React 19 + TypeScript + Tailwind CSS client**
  Set up project structure in `client/` with dependencies (`react`, `react-dom`, `lucide-react`, `tailwindcss`, `@types/react`, `@types/node`).
- [ ] **Step 2: Configure design tokens and base styles**
  Define color palette (`#07090E`, `#0D111D`, `#131B2E`, `#1E293B`, `#6366F1`, `#8B5CF6`, `#10B981`, `#EF4444`), glow effects, and typography in `tailwind.config.js` and `index.css`.
- [ ] **Step 3: Build Navbar and Hero with URL input bar**
  Implement TrueTube lightning wordmark, navigation links, GitHub badge, glowing headline "Download the web. Your way.", input container with clipboard paste trigger, and gradient "Analyze" button.
- [ ] **Step 4: Build State 1 (Analyzing) with circular glow spinner & stage checklist**
  Validating URL, Fetching metadata, Checking formats checklist with pulsing animations.
- [ ] **Step 5: Build State 2 & 3 (Media Info & Format Selection)**
  Thumbnail preview with duration overlay, channel details, duration, approx size, subtitles count, Video/Audio tabs, format cards (MP4, WebM, MKV), resolution radio selector (4K to 360p), audio stream selector.
- [ ] **Step 6: Build State 4 & 5 (Downloading Progress & Completed)**
  Dual-tone glowing progress bar, speed indicator, ETA, 5-stage timeline, Cancel button, and green checkmark Completed card with "Download File" and "Download Another".
- [ ] **Step 7: Build State 6 & 7 (Advanced Options Drawer & Recent Downloads)**
  Slide-out drawer with toggles for audio-only, subtitles, metadata, thumbnail, filename template, and container selector. Recent downloads table with quick actions.
- [ ] **Step 8: Build Error States, Feature Sections, FAQ, and Footer**
  Invalid URL, Unsupported Source, Network Error cards, 4 value-prop cards, supported formats chips, How It Works, FAQ accordion, CTA banner, and footer.
- [ ] **Step 9: Run Task 1 Review Agent**
  Dedicated subagent / verification checking visual fidelity against Stitch reference, component architecture, responsiveness, and zero console errors.

---

### Task 2: yt-dlp Engine + Real Backend API

**Files:**
- Create: `server/requirements.txt`
- Create: `server/app/main.py`
- Create: `server/app/config.py`
- Create: `server/app/core/security.py`
- Create: `server/app/services/ytdlp_service.py`
- Create: `server/app/models/schemas.py`
- Create: `server/app/api/routes.py`
- Create: `server/tests/test_analyzer.py`

**Interfaces:**
- Consumes: Target URLs via `POST /api/analyze`.
- Produces: Normalized `MediaInfoResponse` schema containing title, thumbnail, duration, view count, formats array (id, ext, resolution, fps, filesize, vcodec, acodec), audio streams, and available subtitles.

- [ ] **Step 1: Set up FastAPI server environment and configuration**
  Define `config.py` for CORS, storage paths, limits, and FFmpeg path resolution.
- [ ] **Step 2: Implement URL validator and security filters**
  Validate URLs: ensure `http`/`https` scheme, resolve host IP and block private/loopback CIDRs (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- [ ] **Step 3: Implement YtDlpService for extraction and format normalization**
  Use native `yt_dlp.YoutubeDL` with `extract_info(url, download=False)`. Parse formats into categorized lists (video-with-audio, video-only, audio-only), extract available subtitle languages, and compute estimated sizes.
- [ ] **Step 4: Implement `/api/analyze` and `/api/health` endpoints**
  Wire route handler with detailed error translation (unsupported URL, video private/unavailable, extraction error).
- [ ] **Step 5: Write backend unit tests for security and analysis**
  Verify URL validation blocks SSRF, and verify extraction returns normalized schemas.
- [ ] **Step 6: Run Task 2 Review Agent**
  Inspect backend architecture, input sanitization, error responses, and test execution.

---

### Task 3: Real Asynchronous Download Pipeline

**Files:**
- Create: `server/app/services/job_manager.py`
- Create: `server/app/services/download_pipeline.py`
- Modify: `server/app/api/routes.py`
- Create: `server/tests/test_download_pipeline.py`

**Interfaces:**
- Consumes: `DownloadJobRequest` with format ID, audio options, subtitles, postprocessing settings.
- Produces: `POST /api/jobs`, `GET /api/jobs/{id}`, `GET /api/jobs/{id}/progress` (SSE), `POST /api/jobs/{id}/cancel`, `GET /api/jobs/{id}/file`.

- [ ] **Step 1: Implement JobManager with thread-safe queue and state tracking**
  Manage job states (`QUEUED`, `ANALYZING`, `DOWNLOADING`, `PROCESSING`, `FINALIZING`, `COMPLETED`, `FAILED`, `CANCELLED`).
- [ ] **Step 2: Implement DownloadPipeline with native yt-dlp progress hooks**
  Build custom progress hook translating byte updates into percentage, download speed (MB/s), ETA (seconds), and stage transitions. Implement cooperative cancel token checking.
- [ ] **Step 3: Implement stream merging, audio extraction, and subtitle embedding**
  Configure yt-dlp postprocessors for FFmpeg remuxing (`--merge-output-format`), audio extraction (`ExtractAudio`), and metadata embedding.
- [ ] **Step 4: Implement Server-Sent Events (SSE) streaming endpoint**
  Stream live progress events to client via `GET /api/jobs/{id}/progress` with keep-alive and graceful close on job completion.
- [ ] **Step 5: Implement file serving and storage lifecycle**
  Deliver completed file with sanitized `Content-Disposition`. Implement TTL cleanup thread to prune temp files.
- [ ] **Step 6: Write integration tests for job creation, progress, cancellation, and retrieval**
- [ ] **Step 7: Run Task 3 Review Agent**
  Verify real download handling, cancellation resilience, stream cleanup, and test pass.

---

### Task 4: Production UX + Frontend-Backend Integration

**Files:**
- Create: `client/src/services/api.ts`
- Create: `client/src/hooks/useMediaAnalyzer.ts`
- Create: `client/src/hooks/useDownloadJob.ts`
- Create: `client/src/hooks/useRecentDownloads.ts`
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/DownloadingState.tsx`
- Modify: `client/src/components/CompletedState.tsx`
- Modify: `client/src/components/RecentDownloads.tsx`

**Interfaces:**
- Connects frontend UI to real backend endpoints.
- Replaces mock data flow with live API interactions.

- [ ] **Step 1: Implement typed API client and SSE event listener**
  Connect to `/api/analyze`, `/api/jobs`, `/api/jobs/{id}/progress`, `/api/jobs/{id}/cancel`, and `/api/jobs/{id}/file`.
- [ ] **Step 2: Wire real analysis flow to UI**
  Trigger live analysis, show authentic loading checklist with timing, and populate format cards with genuine stream options.
- [ ] **Step 3: Wire real download and live progress pipeline to UI**
  Render real percentages, instantaneous download speed, accurate ETA countdown, and active stage milestones.
- [ ] **Step 4: Implement download file trigger and recent downloads persistence**
  Auto-trigger browser file download on completion, save job metadata into browser `localStorage`, and enable one-click redownload.
- [ ] **Step 5: Polish mobile responsiveness and accessibility**
  Verify touch targets, ARIA live regions for screen readers, responsive flex/grid wrappers, and zero layout shift.
- [ ] **Step 6: Run Task 4 Review Agent**
  Audit end-to-end user experience, error edge cases, mobile presentation, and visual fidelity.

---

### Task 5: Final Full-Stack Audit, Security & Delivery

**Files:**
- Create: `README.md`
- Create: `ARCHITECTURE.md`
- Create: `API.md`
- Create: `DEVELOPMENT.md`
- Create: `DEPLOYMENT.md`
- Create: `SECURITY.md`
- Create: `.env.example`
- Create: `e2e_full_audit.py`

**Interfaces:**
- Complete deployment documentation and automated full-stack verification script.

- [ ] **Step 1: Execute full production test suite**
  Run frontend TypeScript checks (`tsc --noEmit`), Vite production build (`npm run build`), backend Pytest suite, and linting.
- [ ] **Step 2: Run end-to-end integration audit script**
  Verify complete lifecycle with a public creative-commons test media: Analyze -> Format -> Job -> Progress -> File -> Storage Cleanup.
- [ ] **Step 3: Author comprehensive documentation**
  Write detailed guides covering architecture, setup, yt-dlp/ffmpeg prerequisites, API specifications, and deployment.
- [ ] **Step 4: Run Final Review Agent**
  Verify BUILD = GREEN, TESTS = GREEN, CORE DOWNLOAD FLOW = WORKING, UI = MATCHES DESIGN, SECURITY = REVIEWED.
