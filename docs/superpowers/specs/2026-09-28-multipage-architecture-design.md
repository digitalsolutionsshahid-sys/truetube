# Specification: TrueTube Multi-Page Architecture

- **Status**: Proposed
- **Author**: Antigravity & TrueLife Academy Team
- **Date**: 2026-09-28
- **Topic**: Multi-Page Transition, Dedicated Page Content, and Clean Home Experience

---

## 1. Executive Summary

TrueTube will transition from a single-page long-scroll application into a structured multi-page web application. Each core section will have its own dedicated page with comprehensive, high-value content, while the Home page will remain clean, focused, and centered around fast, intuitive media downloading.

The navigation system will use a lightweight, zero-dependency Native SPA Router with HTML5 History API integration (`pushState`, `popstate`), ensuring:
- Instant page transitions with zero full-page reloads.
- Full browser Back/Forward navigation support.
- Deep-linkable and bookmarkable URLs (`/`, `/features`, `/supported`, `/faq`, `/about`, `/contact`).
- 100% zero-configuration deployment compatibility on Vercel, Netlify, and local development.

---

## 2. Page Architecture & Content Strategy

### 2.1 Home Page (`/`)
- **Purpose**: Direct, uncluttered media analyzing and downloading.
- **Hero Area**:
  - Interactive 3D particle constellation canvas background ([`ThreeDScene.tsx`](file:///c:/Users/aDmin/Documents/Yt%20Download%20website/client/src/components/ThreeDScene.tsx)).
  - Clean URL input box with empty initial state.
  - Platform quick-chips for instant visual cues.
- **Download Workflow Center**:
  - State 1: Real-time analysis status indicator.
  - State 2: Media preview with thumbnail, metadata specs, and duration badge.
  - State 3: Format selector restricted strictly to **MP4** for video, plus audio formats (MP3, M4A, WAV, Opus).
  - State 4: Real-time SSE download progress bar with stage timeline.
  - State 5: Completed state with automatic Chrome browser download trigger and immediate server storage purge.
- **Recent Downloads**:
  - Locally persisted list of recent downloads with one-click re-download.
- **Home Highlights Overview**:
  - A compact 3-column highlight teaser introducing Features, Supported Platforms, and TrueLife Academy, with direct CTA links to the full pages.

### 2.2 Features Page (`/features`)
- **Purpose**: Comprehensive technical showcase of TrueTube's media processing engine.
- **Content Sections**:
  - **4K Ultra HD & 60FPS MP4 Engine**: How yt-dlp merges highest-grade video and audio streams seamlessly using FFmpeg.
  - **Zero Server Storage / Pure Browser Delivery**: Technical explanation of memory minimization and immediate temporary file purge via background tasks.
  - **Lossless Audio Extraction**: 320kbps MP3, AAC, and WAV audio remastering.
  - **Metadata & Chapter Preservation**: Automatic ID3 tagging, cover art embedding, and chapters.
  - **Comparison Matrix**: Detailed comparison between TrueTube and typical spammy/malware-infested downloader websites.

### 2.3 Supported Platforms Page (`/supported`)
- **Purpose**: Full directory of media sources, codecs, and playback guidelines.
- **Content Sections**:
  - **Platform Directory**: Interactive grid of supported platforms (YouTube, Vimeo, TikTok, Instagram, Twitter/X, Facebook Video, SoundCloud, Bandcamp, Twitch, Reddit, etc.) with format capabilities per platform.
  - **Container & Codec Guide**: Detailed overview of MP4 (H.264 / AAC) universal compatibility across iPhone, Android, Windows, Mac, and smart TVs.
  - **Tips for Maximum Quality**: Instructions on selecting source qualities and audio bitrates.

### 2.4 FAQ & Help Page (`/faq`)
- **Purpose**: Complete self-service answers to common questions and troubleshooting.
- **Content Sections**:
  - **Interactive Accordion Categories**:
    - *Downloads & Quality*: Why MP4 only? Can I download 4K?
    - *Storage & Browser Downloads*: Where do files go? Why doesn't TrueTube keep files on the server?
    - *Errors & Troubleshooting*: What to do if a URL fails to analyze, rate limits, or private videos.
    - *Copyright & Terms*: Personal backups vs copyright policies.
  - **Status & Diagnostics Banner**: Quick check guide showing backend status and versioning.

### 2.5 About TrueLife Academy Page (`/about`)
- **Purpose**: Full dedicated landing page for TrueLife Academy.
- **Content Sections**:
  - **Hero Banner**:
    - Headline: *"From Beginner to Professional: Complete Practical Training"*.
    - Slogan: *"آج سیکھیں، کل کمائیں" / "Learn Today, Earn Tomorrow"*.
    - Academy Mission: Practical AI skills to generate real income.
  - **4 Core AI Pillars (with 3D Tilt Cards)**:
    1. *AI Prompt Engineering*: LLMs, role workflows, prompt templates.
    2. *AI Web Design*: Responsive landing pages, UI/UX with AI assistance.
    3. *AI Graphic Design*: High-CTR thumbnails, branding kits, AI image generation.
    4. *AI Content Creation*: Scripting, AI voiceovers, YouTube/Reels automation.
  - **Student Roadmap (5 Steps)**: Beginner -> Master Prompts -> Create Designs -> Build Projects -> Monetize.
  - **Course Schedule & Training Details**: 2 months, 3 classes/week, 24 practical hands-on sessions.
  - **Location & Enrollment Actions**:
    - Location: Ahmadpur Sial, Pakistan.
    - Direct WhatsApp chat link: `03331200038` (`https://wa.me/923331200038`).
    - Facebook page: `https://web.facebook.com/TrueLifeAcademyOfficial/`.

### 2.6 Contact & Support Page (`/contact`)
- **Purpose**: Direct communication hub for TrueTube users and TrueLife Academy students.
- **Content Sections**:
  - **Direct WhatsApp Chat Card**: Fast-track communication with Academy instructors (`03331200038`).
  - **Official Social Channels**: Facebook Official Page and community resources.
  - **Interactive Message/Inquiry Form**: For course inquiries, feedback, or technical assistance.
  - **Location & Working Hours**: Ahmadpur Sial campus information.

---

## 3. Router & Navigation Architecture

### 3.1 Router Design
A dedicated, custom routing controller will be implemented in `client/src/router/`:
```typescript
export type PageRoute = 'home' | 'features' | 'supported' | 'faq' | 'about' | 'contact';
```
- Listens to `popstate` events for browser back/forward buttons.
- Synchronizes with `window.location.pathname` or hash for bookmarks and deep links.
- Provides `navigateTo(page: PageRoute)` helper that calls `window.history.pushState` and smoothly scrolls to top.
- Exposes current route and navigation helpers via React Context or state hook.

### 3.2 Navigation & Footer Integration
- **Navbar**:
  - Highlights active page with electric violet/indigo pill indicator.
  - Clicking any tab (`Home`, `Features`, `Supported`, `FAQ`, `About`, `Contact`) switches pages immediately.
  - "Made by TrueLife Academy" and WhatsApp `03331200038` remain persistently visible.
- **Footer**:
  - All footer links navigate to their respective dedicated pages.
  - Academy branding and copyright remain intact.

---

## 4. Implementation Plan & File Breakdown

1. **Routing System**:
   - Create `client/src/router/RouterContext.tsx` handling routes, browser history, and scroll restoration.
2. **Page Components**:
   - `client/src/pages/HomePage.tsx`: Hero input, 3D scene, media download pipeline, recent downloads, concise feature preview.
   - `client/src/pages/FeaturesPage.tsx`: Detailed feature breakdown and comparison matrix.
   - `client/src/pages/SupportedPage.tsx`: Platform directory and codec guide.
   - `client/src/pages/FaqPage.tsx`: Comprehensive categorized accordion FAQ.
   - `client/src/pages/AboutPage.tsx`: Full TrueLife Academy showcase with 3D cards and Urdu slogan.
   - `client/src/pages/ContactPage.tsx`: WhatsApp, Facebook, inquiry form, and location details.
3. **Shell Updates**:
   - Update `client/src/components/Navbar.tsx` for active route states.
   - Update `client/src/components/Footer.tsx` for direct page navigation.
   - Refactor `client/src/App.tsx` into a clean layout container with the router switcher.
4. **Verification**:
   - `npm run lint` (0 errors, 0 warnings).
   - `npm run build` (clean TypeScript compilation).
   - Backend `pytest` suite validation (31/31 passed).

---

## 5. Security & Performance Considerations
- No external routing libraries needed: zero extra bundle weight.
- Browser download trigger and server storage cleanup remain fully active in `HomePage.tsx`.
- Immediate cleanup of SSE listeners when navigating between pages.
