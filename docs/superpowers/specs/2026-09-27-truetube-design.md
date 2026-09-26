# TrueTube — Product Design Specification

**Document Version:** 1.0.0  
**Date:** 2026-09-27  
**Status:** Approved  
**Visual Reference:** Stitch Design Sheet (`media_1790459927625.jpg`)  

---

## 1. Executive Summary & Vision

**TrueTube** is a modern, production-grade media downloading and processing web platform powered by `yt-dlp` and `FFmpeg`.

TrueTube replaces generic, sketchy, ad-ridden web downloaders with an ultra-clean, cyberpunk-minimalist SaaS interface. It provides real-time format analysis, customizable audio/video streams, live download progress reporting via Server-Sent Events (SSE), and reliable local/cloud delivery of media files.

---

## 2. Visual & Design System Requirements

TrueTube faithfully implements the visual language defined in the **Stitch design reference**:

### 2.1 Theme & Color Palette
- **Backgrounds:**
  - Base canvas: `#07090E` (Deep void black)
  - Card & Container background: `#0D111D` to `#111827` (Deep navy midnight)
  - Elevated surfaces / Modals: `#131B2E`
  - Subtle glow: Radial gradient `radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`
- **Borders & Dividers:**
  - Standard border: `#1E293B` (1px subtle border)
  - Active/Hover border: `#4338CA` / `#6366F1` with 0.5px glow
- **Accents & Highlights:**
  - Primary Electric Accent: `#6366F1` (Indigo) to `#8B5CF6` (Violet) gradient
  - Accent Secondary: `#3B82F6` (Electric Blue)
  - Success: `#10B981` (Emerald green)
  - Warning: `#F59E0B` (Amber)
  - Error: `#EF4444` (Rose red)
- **Typography:**
  - Font: `Inter`, system-ui, sans-serif
  - High-contrast headings in pure white `#F8FAFC`
  - Body text in `#94A3B8` / `#CBD5E1`
  - Muted captions in `#64748B`

### 2.2 Core UI States (from Stitch reference)
1. **Hero & Input State:**
   - Wordmark: Lightning bolt glyph + "TrueTube" in bold modern typography.
   - Hero header: "Download the web. **Your way.**" (with glowing violet/indigo gradient text).
   - Glassmorphism URL input container with link icon, clean input, "Paste from clipboard" trigger, and vibrant "Analyze" gradient button.
   - Platform support badges (YouTube, TikTok, Vimeo, Twitter/X, Instagram, and 1000+ more).
   - Value-prop cards: Fast, High Quality, Flexible Formats, Simple Workflow.
   - Supported Formats card (Video: MP4, WebM, MKV, AVI, MOV; Audio: MP3, M4A, WAV, AAC, OPUS).
   - "How It Works" 3-step section.
   - "Advanced Capabilities" 6-card feature grid.
   - Accordion FAQ and final CTA banner.
2. **State 1: URL Pasted / Analyzing:**
   - Glowing circular spinner with pulse.
   - Real-time step checklist:
     - [✓] Validating URL
     - [⟳] Fetching metadata
     - [○] Checking formats
3. **State 2: Media Information:**
   - Left Card: High-resolution media thumbnail with 16:9 aspect ratio, play icon overlay, bottom-right duration badge (`03:24`), video title, uploader/channel name with verified badge, view count, publish date, and source link badge.
   - Right Card: "Media Information" breakdown:
     - Duration
     - Size (estimated)
     - Available Formats
     - Audio Formats
     - Subtitles count and languages
4. **State 3: Format Selection:**
   - Mode Tabs: `[Video]` and `[Audio]`.
   - 3-Column format picker:
     - **Format column:** MP4 (H.264 - Widely supported, "Recommended"), WebM (VP9 - Great quality), MKV (Flexible), AVI.
     - **Quality column:** Best 4K (3840x2160, "Recommended"), 1440p, 1080p, 720p, 480p, 360p with estimated file size badges.
     - **Audio column:** AAC (default), Opus, MP3 with bitrate options (128 kbps, 256 kbps, 320 kbps).
   - Action bar: "Advanced Options" toggle, large primary "Download" CTA button, "Copy Link", and "More Options".
5. **State 4: Downloading / Progress:**
   - Active media banner card.
   - Live numerical statistics: percentage (`62%`), speed (`7.4 MB/s`), ETA (`00:32`).
   - Glowing dual-tone gradient progress bar.
   - 5-step processing timeline:
     - [✓] Fetching information
     - [✓] Preparing media
     - [⚡] Downloading
     - [○] Processing (merging streams / extracting audio)
     - [○] Finalizing
   - "Cancel Download" secondary danger button.
6. **State 5: Download Completed:**
   - Vibrant emerald success badge: "Download Complete! Your file has been processed successfully."
   - Result card showing final container, resolution, and exact file size.
   - Primary CTA: "Download File" (triggers direct browser download from server).
   - Secondary CTA: "Download Another" (resets back to fresh input state).
7. **State 6: Advanced Options Drawer / Modal:**
   - Audio Only toggle switch.
   - Subtitles language selector (All, English, None, etc.).
   - Embed Metadata toggle.
   - Embed Thumbnail toggle.
   - Filename template input (e.g. `%(title)s.%(ext)s`).
   - Quality preference (Best, High, Medium, Low).
   - Container format preference.
8. **State 7: Recent Downloads List:**
   - Local storage powered log of recent jobs.
   - Shows thumbnail, title, format, file size, timestamp, and status.
   - Direct download or redownload trigger.
9. **Error States:**
   - Invalid URL card with "Try Again".
   - Unsupported Source card with "View Supported Sites".
   - Network Error card with "Retry".
   - Download Failed card with descriptive human-friendly resolution steps.

---

## 3. Technology Stack & Architecture

### 3.1 Frontend (`client/`)
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS with custom theme tokens (`tailwind.config.js`).
- **Icons:** `lucide-react`.
- **State Management:** Reactive component state with custom hooks (`useMediaAnalyzer`, `useDownloadJob`, `useRecentDownloads`).
- **Real-Time Client:** Native EventSource / Server-Sent Events client with auto-reconnection and state reconciliation.

### 3.2 Backend (`server/`)
- **Runtime:** Python 3.14 + FastAPI + Uvicorn.
- **Core Engine:** Native Python `yt_dlp` library (`import yt_dlp`).
- **Media Post-Processor:** FFmpeg 8.1.1 + FFprobe (installed and verified).
- **Process & Concurrency Model:**
  - `ThreadPoolExecutor` for non-blocking asynchronous yt-dlp execution.
  - In-memory `JobManager` with thread-safe locks.
  - Native yt-dlp progress hooks capturing exact bytes, speed, ETA, and stage transitions.
  - Cooperative cancellation via `DownloadCancelled` exception in progress hook.
- **Real-time Protocol:** Server-Sent Events (`text/event-stream`) streaming structured JSON events.
- **Storage & Lifecycle:**
  - Controlled temp directory (`storage/temp/{job_id}/`).
  - Auto-cleanup daemon thread cleaning completed/failed files after TTL (default 1 hour).
  - Explicit cleanup on cancellation and failure.

---

## 4. API Specification

### 4.1 Endpoints
- `POST /api/analyze`
  - Input: `{ "url": "https://..." }`
  - Output: Normalized media metadata, duration, thumbnails, uploader, views, available video formats (resolutions, codecs, fps, filesize), audio streams, and available subtitles.
- `POST /api/jobs`
  - Input: `{ "url": "...", "format_id": "...", "resolution": "1080p", "container": "mp4", "audio_codec": "aac", "audio_only": false, "subtitles": "en", "embed_metadata": true, "embed_thumbnail": false }`
  - Output: `{ "job_id": "uuid", "status": "QUEUED" }`
- `GET /api/jobs/{id}`
  - Output: Current job snapshot (status, progress, speed, ETA, filename, error).
- `GET /api/jobs/{id}/progress`
  - Output: Server-Sent Events stream emitting `message: {"type": "progress", ...}` or `{"type": "completed", ...}`.
- `POST /api/jobs/{id}/cancel`
  - Output: `{ "success": true, "message": "Job cancelled" }`
- `GET /api/jobs/{id}/file`
  - Output: Binary media stream (`application/octet-stream` or `video/mp4` etc.) with `Content-Disposition: attachment; filename="..."`.
- `GET /api/health`
  - Output: Engine status (`yt-dlp` version, `ffmpeg` version, active jobs, temp storage usage).

---

## 5. Security & Safety Controls
1. **SSRF Prevention:** Whitelist URL protocols (`http://`, `https://`). Block `file://`, `ftp://`, loopback (`127.0.0.1`, `localhost`), and private IP ranges (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`).
2. **Command Injection Prevention:** Zero shell command execution. All invocations happen through Python's in-process `yt_dlp.YoutubeDL` with typed dictionary options.
3. **Path Traversal Prevention:** Safe filename sanitization using `sanitize_filename()` and strictly isolated job directories (`storage/temp/{job_id}/`).
4. **Resource Bounds:** Max concurrent jobs limit (e.g. 5 concurrent downloads), individual job timeout (15 minutes), max disk quota enforcement.

---

## 6. Verification & Five-Task Progression
- **Task 1:** Foundation, Design System, Full Visual States & Components matching Stitch reference. Verified by Task 1 Review Agent.
- **Task 2:** Backend Architecture, Python yt-dlp service, metadata extractor, and `/api/analyze` endpoint. Verified by Task 2 Review Agent.
- **Task 3:** Asynchronous Download Pipeline, FFmpeg stream merging, SSE progress reporting, cancellation, and file retrieval. Verified by Task 3 Review Agent.
- **Task 4:** End-to-end integration, real-time UX polish, error resilience, recent downloads local persistence, mobile optimization. Verified by Task 4 Review Agent.
- **Task 5:** Production test suite, security hardening, full audit, documentation, and final delivery verification. Verified by Final Review Agent.
