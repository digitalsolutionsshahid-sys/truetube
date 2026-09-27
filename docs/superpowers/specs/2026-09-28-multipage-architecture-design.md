# Specification: TrueTube Multi-Page Architecture

- **Status**: Approved with User Adjustments
- **Author**: Antigravity & TrueLife Academy Team
- **Date**: 2026-09-28
- **Topic**: Multi-Page Transition, Removal of Supported Section/Button, Dedicated Pages per Topic

---

## 1. Executive Summary

TrueTube will transition from a single-page scrolling site into a multi-page web application. Each core section will live on its own dedicated page with its own rich content. The Home page will remain clean and focused solely on the media downloading experience without clutter.

Per direct user requirement:
1. **About TrueLife Academy** lives exclusively on the dedicated **About Page** (`/about`).
2. **Features** lives exclusively on the dedicated **Features Page** (`/features`).
3. **FAQ** lives exclusively on the dedicated **FAQ Page** (`/faq`).
4. **Remove "Supported" Navigation**: The "Supported" navigation button is removed from the Navbar.
5. **Delete "Supported Formats" Section**: The "Supported Formats" section (displaying Video: MP4, WebM, MKV, AVI, MOV and Audio: MP3, M4A, etc.) is removed entirely from the website.
6. **Clean Home Page**: The Home page contains *only* the core downloader components (Hero input with 3D constellation, analyzing state, media preview, format selector locked to MP4, download progress, completed state, and recent downloads).

The routing system will use a lightweight, zero-dependency Native SPA Router with HTML5 History API integration (`pushState`, `popstate`), ensuring instant page switches, browser Back/Forward support, and deep shareable URLs (`/`, `/features`, `/faq`, `/about`).

---

## 2. Page Structure & Breakdown

### 2.1 Home Page (`/`)
- **Visuals**: Interactive 3D particle constellation canvas background ([`ThreeDScene.tsx`](file:///c:/Users/aDmin/Documents/Yt%20Download%20website/client/src/components/ThreeDScene.tsx)).
- **Core Downloader Workflow**:
  - Hero URL input with empty initial state.
  - Analyzing state.
  - Media preview.
  - Format selector (strictly MP4 for video, plus audio formats).
  - SSE real-time download progress.
  - Completed state with automatic Chrome browser download trigger and server storage purge.
- **Recent Downloads**:
  - Locally persisted list of recent downloads with one-click re-download.
- **No Extra Clutter**: No Features or About sections rendered on the home page.

### 2.2 Features Page (`/features`)
- **Header**: High-impact title & subtitle showcasing TrueTube's technical engine.
- **Core Feature Grid (4 Cards)**:
  - 4K Ultra HD & 60FPS Stream Merging via yt-dlp + FFmpeg.
  - Pure Browser Delivery & Zero Server Storage Overhead (immediate temporary file purge).
  - High-Bitrate Audio Extraction (320kbps MP3, AAC, WAV, Opus).
  - Smart Metadata & Chapter Injection.
- **How It Works (3 Steps)**:
  1. Paste Media URL.
  2. Select MP4 Resolution or Audio Bitrate.
  3. Save Directly in Chrome.
- **Advanced Capabilities Grid (6 Cards)**:
  - Multi-stream merging, playlist support, anti-throttling algorithms, live progress reporting, background worker lifecycle, SSL/TLS validation.

### 2.3 FAQ Page (`/faq`)
- **Header**: Clear help & frequently asked questions title.
- **Categorized Accordion**:
  - *Downloads & Formats*: Why is MP4 the only video format? Can I download 4K/60fps?
  - *Storage & Browser Downloads*: Where do files save? Why does TrueTube immediately wipe files from the server?
  - *Troubleshooting*: What to do if analysis times out or media is geo-restricted?
  - *Terms & Copyright*: Personal media backup policy and Fair Use guidelines.
- **Quick Support Card**: Direct WhatsApp chat button for immediate assistance (`03331200038`).

### 2.4 About TrueLife Academy Page (`/about`)
- **Header & Slogans**:
  - Headline: *"From Beginner to Professional: Complete Practical Training"*.
  - Slogan: *"آج سیکھیں، کل کمائیں" / "Learn Today, Earn Tomorrow"*.
  - Mission statement for TrueLife Academy.
- **4 Core AI Pillars with 3D Tilt Cards**:
  1. *AI Prompt Engineering*: Prompt structure, roles, LLM workflows.
  2. *AI Web Design*: Modern landing pages, responsive layouts, client delivery.
  3. *AI Graphic Design*: High-CTR YouTube thumbnails, branding kits, AI image generation.
  4. *AI Content Creation*: Video scripts, AI voiceovers, Reels/Shorts workflows.
- **5-Stage Student Roadmap**: Beginner -> Master Prompts -> Create Designs -> Build Projects -> Monetize.
- **Course Schedule & Details**: 2 months, 3 classes/week, 24 practical sessions.
- **Location & Enrollment**:
  - Location: Ahmadpur Sial, Pakistan.
  - WhatsApp: `03331200038` (`https://wa.me/923331200038`).
  - Facebook Page: `https://web.facebook.com/TrueLifeAcademyOfficial/`.

---

## 3. Navbar & Footer Updates

### 3.1 Navbar
- **Remove**: "Supported" nav button.
- **Active Navigation Links**:
  - `Home` (`/`)
  - `Features` (`/features`)
  - `FAQ` (`/faq`)
  - `About` (`/about`)
- **Active Pill Highlight**: Distinct electric violet pill indicator for current route.
- **Branding**: "Made by TrueLife Academy Team" and WhatsApp (`03331200038`) persistent in top-right.

### 3.2 Footer
- **Remove**: "Supported" link and any reference to Supported Formats.
- **Page Links**: Home, Features, FAQ, About Academy, Facebook.
- **TrueLife Academy Info**: Mission, Ahmadpur Sial location, WhatsApp link, and copyright.

---

## 4. Native Router Architecture

- **Path Mapping**:
  - `'/'` -> `HomePage`
  - `'/features'` -> `FeaturesPage`
  - `'/faq'` -> `FaqPage`
  - `'/about'` -> `AboutPage`
- **History Management**:
  - `window.history.pushState` on page clicks.
  - `window.addEventListener('popstate')` for browser back/forward buttons.
  - Automatic `window.scrollTo({ top: 0, behavior: 'instant' })` on every route change.
- **Zero External Dependencies**: Fast, lightweight, 100% reliable.
