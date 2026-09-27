# Multi-Page Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform TrueTube into a multi-page web application where each topic has its own dedicated page (Home, Features, FAQ, About), remove the Supported Formats section and button completely, and keep the Home page strictly focused on media downloading.

**Architecture:** A zero-dependency Native SPA Router with HTML5 History API integration (`pushState`, `popstate`) maps pathnames (`/`, `/features`, `/faq`, `/about`) to dedicated page components (`HomePage`, `FeaturesPage`, `FaqPage`, `AboutPage`), ensuring instant page switches, browser Back/Forward navigation, deep shareable URLs, and 100% Vercel compatibility.

**Tech Stack:** React 19, TypeScript, TailwindCSS v4, Vite 8, Lucide React, FastAPI backend.

**Spec:** [`docs/superpowers/specs/2026-09-28-multipage-architecture-design.md`](file:///c:/Users/aDmin/Documents/Yt%20Download%20website/docs/superpowers/specs/2026-09-28-multipage-architecture-design.md)

## Global Constraints

- **No Supported Button or Section**: Remove the "Supported" navigation button and completely delete the "Supported Formats" section (the box containing Video: MP4, WebM, MKV, AVI and Audio: MP3, M4A, etc.).
- **Clean Home Page**: The Home page contains ONLY the core downloader (Hero input, 3D scene, media preview, MP4 format selector, real-time progress, Chrome auto-download, recent downloads).
- **Dedicated Pages**:
  - `/features` -> Features Page
  - `/faq` -> FAQ Page
  - `/about` -> About TrueLife Academy Page
- **Zero External Router Dependencies**: Implement using native browser History API to guarantee zero runtime weight and zero Vercel routing configuration issues.
- **Strict Video Container**: Only MP4 allowed for video.
- **TrueLife Academy Branding & WhatsApp**: Preserved in Navbar and Footer.

## Review Focus

1. **Browser Back/Forward Navigation**: Ensure pressing the browser back and forward buttons switches pages correctly without reloading.
2. **Deep-Linking**: Direct loading of `/features`, `/faq`, or `/about` displays the respective page properly.
3. **Scroll Restoration**: Navigating to any new page automatically resets window scroll position to the top (`0, 0`).
4. **State Isolation**: Home page download workflow state (SSE connections, cancellation, input) does not leak into other pages.
5. **No Broken References**: Removing the Supported Formats section must not break any imports, types, or layout styles.

---

### Task 1: Native SPA Router Engine

**Files:**
- Create: `client/src/router/routes.ts`
- Create: `client/src/router/RouterContext.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export type AppRoute = 'home' | 'features' | 'faq' | 'about';
  export interface RouterContextType {
    route: AppRoute;
    navigateTo: (target: AppRoute) => void;
  }
  export const useRouter: () => RouterContextType;
  export const RouterProvider: React.FC<{ children: React.ReactNode }>;
  ```

- [ ] **Step 1: Define route types and path mapping helper**
  Create `client/src/router/routes.ts` mapping URL paths to `AppRoute`:
  - `'/'` -> `'home'`
  - `'/features'` -> `'features'`
  - `'/faq'` -> `'faq'`
  - `'/about'` -> `'about'`

- [ ] **Step 2: Implement RouterProvider with pushState and popstate support**
  Create `client/src/router/RouterContext.tsx` with:
  - React Context holding `route: AppRoute`.
  - `popstate` event listener updating `route` when user clicks browser Back/Forward.
  - `navigateTo(target)` pushing `window.history.pushState({}, '', path)` and calling `window.scrollTo({ top: 0, behavior: 'instant' })`.

- [ ] **Step 3: Commit router implementation**
  `git add client/src/router/ && git commit -m "feat(router): add native SPA router with history API support"`

---

### Task 2: Build Dedicated Pages & Delete Supported Formats Section

**Files:**
- Create: `client/src/pages/FeaturesPage.tsx`
- Create: `client/src/pages/FaqPage.tsx`
- Create: `client/src/pages/AboutPage.tsx`
- Modify or Delete: `client/src/components/FeatureSections.tsx`

**Interfaces:**
- Produces:
  - `export const FeaturesPage: React.FC`
  - `export const FaqPage: React.FC`
  - `export const AboutPage: React.FC`

- [ ] **Step 1: Delete Supported Formats section**
  Remove the `Supported Formats` block from the codebase entirely as requested in the user prompt and screenshot.

- [ ] **Step 2: Create FeaturesPage component**
  Build `client/src/pages/FeaturesPage.tsx` containing:
  - 4 Key Features (4K 60FPS streams, pure browser delivery, lossless audio extraction, metadata injection).
  - 3-step How It Works guide.
  - 6 Advanced Capabilities cards.
  - Call-to-action banner navigating back to `/` to start downloading.

- [ ] **Step 3: Create FaqPage component**
  Build `client/src/pages/FaqPage.tsx` containing:
  - Categorized FAQ accordion (Downloads & Quality, Storage & Privacy, Troubleshooting, Copyright & Terms).
  - Support assistance card with WhatsApp `03331200038` direct link.

- [ ] **Step 4: Create AboutPage component**
  Build `client/src/pages/AboutPage.tsx` using `AboutAcademy.tsx` content:
  - Headline: *"From Beginner to Professional: Complete Practical Training"*.
  - Slogan: *"آج سیکھیں، کل کمائیں" / "Learn Today, Earn Tomorrow"*.
  - 4 Core AI Pillars in 3D Tilt Cards.
  - Student transformation roadmap, course schedule, Ahmadpur Sial location badge, and enrollment links.

- [ ] **Step 5: Commit dedicated pages**
  `git add client/src/pages/ client/src/components/ && git commit -m "feat(pages): build dedicated Features, FAQ, and About pages and remove supported formats section"`

---

### Task 3: Isolate and Build Clean HomePage

**Files:**
- Create: `client/src/pages/HomePage.tsx`

**Interfaces:**
- Produces:
  - `export const HomePage: React.FC`

- [ ] **Step 1: Extract Home Downloader into HomePage.tsx**
  Move the complete downloading flow from `App.tsx` into `client/src/pages/HomePage.tsx`:
  - 3D interactive constellation scene.
  - Clean URL input (`HeroInput.tsx`) initializing to empty string.
  - Analyzing state, media preview, format selector (strictly MP4), download progress, and completed state.
  - Automatic Chrome browser download trigger with immediate server storage purge.
  - Recent downloads section.
  - Clean layout with zero feature or about clutter on the home page.

- [ ] **Step 2: Verify component modularity and zero mock dependencies**
  Ensure all real API hooks and toast events connect properly.

- [ ] **Step 3: Commit HomePage component**
  `git add client/src/pages/HomePage.tsx && git commit -m "feat(home): isolate clean home page with 3D hero and media downloader"`

---

### Task 4: Update Navigation Shell (Navbar, Footer, App.tsx)

**Files:**
- Modify: `client/src/components/Navbar.tsx`
- Modify: `client/src/components/Footer.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Update Navbar.tsx**
  - Remove the "Supported" navigation button completely.
  - Wire navigation links: `Home`, `Features`, `FAQ`, `About` using `useRouter()`.
  - Highlight the currently active page with an electric violet badge.
  - Keep "Made by TrueLife Academy Team" and WhatsApp `03331200038` visible.

- [ ] **Step 2: Update Footer.tsx**
  - Remove any "Supported" links.
  - Wire links to navigate directly to `/`, `/features`, `/faq`, `/about` via `useRouter()`.
  - Keep TrueLife Academy info, Facebook page, WhatsApp link, and copyright notice.

- [ ] **Step 3: Update App.tsx with Router switcher**
  - Wrap application in `<RouterProvider>`.
  - Render `<Navbar />`, the active page component (`<HomePage />`, `<FeaturesPage />`, `<FaqPage />`, or `<AboutPage />`), and `<Footer />`.
  - Include global `<ToastContainer />`.

- [ ] **Step 4: Commit shell and routing wireup**
  `git add client/src/App.tsx client/src/components/Navbar.tsx client/src/components/Footer.tsx && git commit -m "feat(shell): wire multi-page navigation and remove supported button"`

---

### Task 5: Verification & Full-Stack Testing

- [ ] **Step 1: Run client lint and build**
  `cd client && npm run lint && npm run build`
  Verify 0 errors and 0 warnings.

- [ ] **Step 2: Run server pytest test suite**
  `cd server && python -m pytest tests/ -v -o pythonpath=.`
  Verify all 31 tests pass.

- [ ] **Step 3: Verify multi-page transitions in browser**
  Check that clicking Navbar tabs instantly switches between Home, Features, FAQ, and About, and browser Back/Forward operates seamlessly.
