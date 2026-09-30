# TrueTube UI/UX Trust Repair & Content Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform TrueTube from a 5.5/10 "beautiful shell" into a trusted, fully functional, 8.5+/10 production application by implementing the 5 brutal findings and 3-phase roadmap from the independent UI/UX audit.

**Architecture:** 
1. Expose format (MP4 / MP3) and quality (Best / 1080p / 720p / 320kbps) quick controls on first load before URL entry.
2. Purge fake Unsplash/April-2024 download history; replace with genuine browser `localStorage` and a designed empty state.
3. Clean header by removing personal phone number pill; unify footer labels and fix text collapse.
4. Eliminate duplicate paste button and add privacy microcopy under the input.
5. Enrich homepage with How-It-Works 3-step strip, Supported Platforms marquee, 6-card Features Grid, and FAQ accordion.

**Tech Stack:** React 18, TypeScript, TailwindCSS, Lucide React, Vite, Vercel frontend, Railway backend (yt-dlp).

**Spec:** TrueTube Brutal UI/UX Review & Update Plan (PDF: `media_1790804786222.pdf`).

## Global Constraints

- Never ship mock/fabricated download history as user data.
- No personal phone number in header navigation on any viewport.
- Exactly one paste button in the hero area (in-field chip).
- Retain dark cyber-minimalist design system (#07090E, #0D111D, #1E293B, #6366F1).
- Zero TypeScript compiler errors (`npm run build` must succeed with 0 errors).
- Zero ESLint warnings (`npm run lint` must pass).

## Review Focus

1. Mobile responsiveness at 390px width (iPhone 14 / modern smartphones): buttons, chips, and cards must not overflow horizontally.
2. First-paint consistency: quick format/quality chips must not flicker or disappear after hydration.
3. Empty state handling: first-time visitors with no `localStorage` history must see a polished "No downloads yet" card instead of broken layout or mock data.
4. Input accessibility: URL input and format selection chips must have proper aria labels and keyboard navigation.
5. Vercel production deployment: changes must be built, pushed to GitHub, and verified live on `https://truetube-murex.vercel.app`.

---

### Task 1: Trust Repair — Global Header & Footer Cleanup

**Files:**
- Modify: `client/src/components/Navbar.tsx`
- Modify: `client/src/components/Footer.tsx`

**Interfaces:**
- `Navbar`: exports `React.FC`, removes raw phone number pill, preserves brand, nav links, and TrueLife Academy badge.
- `Footer`: exports `React.FC`, unifies "About" nav label, adds non-breaking heart icon spacing, includes clean WhatsApp support link.

- [ ] **Step 1: Update Navbar.tsx to remove phone number pill**
- [ ] **Step 2: Update Footer.tsx to unify nav labels and fix heart icon collapse**
- [ ] **Step 3: Run `npm run build` in client/ to verify clean compilation**

---

### Task 2: Trust Repair — Visible Format/Quality Selectors & Paste Deduplication

**Files:**
- Modify: `client/src/components/HeroInput.tsx`
- Modify: `client/src/pages/HomePage.tsx`

**Interfaces:**
- `HeroInput`: exports `HeroInputProps` with initial format preset selection (`formatPreset: 'mp4' | 'mp3'`, `qualityPreset: 'best' | '1080p' | '720p' | 'audio_320'`), single in-field paste button, relabeled CTA `"Get download options →"`, and privacy microcopy.
- `HomePage`: passes presets to `HeroInput` and uses them to pre-configure `FormatSelector` when media is analyzed.

- [ ] **Step 1: Refactor HeroInput.tsx with upfront format & quality selector pills**
- [ ] **Step 2: Remove redundant "Paste from clipboard" external button from HeroInput.tsx**
- [ ] **Step 3: Add trust microcopy: "Links are processed securely in memory and never stored."**
- [ ] **Step 4: Relabel CTA to "Get download options →" with "Analyzing..." spinner state**
- [ ] **Step 5: Run `npm run build` in client/ to verify clean compilation**

---

### Task 3: Trust Repair — Genuine LocalStorage & Clean Empty State for Recent Downloads

**Files:**
- Modify: `client/src/mockData.ts`
- Modify: `client/src/components/RecentDownloads.tsx`
- Modify: `client/src/pages/HomePage.tsx`

**Interfaces:**
- `RecentDownloads`: handles `items.length === 0` by rendering a clean empty state card ("No downloads yet — paste a link above to start").
- `HomePage`: initializes `recentDownloads` from `localStorage` defaulting to `[]` (never `MOCK_RECENT_DOWNLOADS`).

- [ ] **Step 1: Update HomePage.tsx initial state to default to empty array `[]`**
- [ ] **Step 2: Update RecentDownloads.tsx with designed empty state for first-time visitors**
- [ ] **Step 3: Test adding and clearing real downloads in localStorage**
- [ ] **Step 4: Run `npm run build` in client/ to verify clean compilation**

---

### Task 4: Content Depth — How It Works, Features Grid, Supported Platforms & FAQ Teaser

**Files:**
- Modify: `client/src/pages/HomePage.tsx`

**Interfaces:**
- `HomePage`: renders:
  1. Hero with initial Format & Quality selectors and trust microcopy
  2. 3-step "How it works" strip (Paste → Choose → Download)
  3. Supported platforms logo/chip strip (YouTube, TikTok, Vimeo, Instagram, X/Twitter, Facebook + 1000+ more)
  4. 6-card Features Grid
  5. FAQ Teaser Accordion (4 questions with link to full FAQ page)
  6. Recent Downloads (real or empty state)

- [ ] **Step 1: Add Supported Platforms chip marquee directly below hero**
- [ ] **Step 2: Add 3-step "How it works" strip under hero card**
- [ ] **Step 3: Add 6-card Features Grid to HomePage.tsx**
- [ ] **Step 4: Add 4-question FAQ Teaser Accordion to HomePage.tsx**
- [ ] **Step 5: Verify section gaps and typography hierarchy**
- [ ] **Step 6: Run `npm run build` in client/ to verify clean compilation**

---

### Task 5: Mobile & Responsive Polish (390px, 768px, 1440px) & Verification

**Files:**
- Modify: `client/src/components/HeroInput.tsx`
- Modify: `client/src/pages/HomePage.tsx`

- [ ] **Step 1: Audit all flex/grid containers for mobile 390px compatibility**
- [ ] **Step 2: Run `npm run lint` and `npm run build`**
- [ ] **Step 3: Commit and push changes to GitHub**
- [ ] **Step 4: Verify deployment on Vercel (`https://truetube-murex.vercel.app`)**
- [ ] **Step 5: Run end-to-end verification and report against audit scorecard**
