# TrueTube Development & Review Records

This file tracks the audit findings, automatic fixes, tests executed, and verification statuses for each of the five development tasks.

---

## Task 1: Foundation + Visual Implementation (Stitch Fidelity)

- **Date**: 2026-09-27
- **Reviewer Agent**: Task 1 Review Agent (UI Finish-Gate Reviewer & Code Reviewer)
- **Target**: `client/` (React 19 + TypeScript + Vite + Tailwind CSS)
- **Visual Reference**: `media_1790459927625.jpg` (Stitch Design Specification)

### Issues Found:
1. **Advanced Options Drawer**: Missing inline toggle switch alongside subtitle language dropdown. Missing ARIA modal attributes and Escape key handling.
2. **Format Selector Action Bar**: Rendered three-dots icon instead of explicit `+ More Options` button with label.
3. **Hero Input Layout**: "Paste from clipboard" button was only inside input rather than on the sub-bar below input.
4. **Analyzing State**: Missing `role="status"` and `aria-live="polite"` for screen readers. Top bar styling did not match Tile 1.
5. **Media Preview Specs**: File size approximation was 326 MB instead of 328 MB as in Tile 2. URL pill lacked interactive copy feedback.
6. **Completed State Copy**: Discrepancies in subtitle text and quality label.
7. **Error States Copy**: Minor wording discrepancies on Unsupported Source and Download Failed cards.
8. **Feature Sections Layout**: FAQ and "Ready to download?" banner were stacked instead of side-by-side (7:5 split on lg).
9. **Showcase Bar in App.tsx**: Grouped States 2 & 3 together instead of allowing direct navigation to all 7 states.

### Issues Fixed:
- Added `subtitles_enabled` to `AdvancedOptionsConfig` in `src/types/media.ts` and enhanced `AdvancedOptionsDrawer.tsx` with toggle switch and Escape handler.
- Updated `FormatSelector.tsx` to render `+ More Options` button.
- Positioned "Paste from clipboard" on the sub-bar below input in `HeroInput.tsx`.
- Updated `AnalyzingState.tsx` with accessibility roles and exact Tile 1 composition.
- Corrected sizes in `mockData.ts` and added interactive copy pill to `MediaPreview.tsx`.
- Updated `CompletedState.tsx` to match Stitch Tile 5 word-for-word (`4K (3840x2160)` and exact subtitle).
- Updated `ErrorCards.tsx` copy.
- Converted `FeatureSections.tsx` to 12-column grid placing FAQ and CTA side-by-side on desktop.
- Enhanced `App.tsx` state machine to support all 7 states individually with an error gallery switcher.

### Tests Executed:
- `npm run lint` (oxlint): 17 files scanned, 0 errors, 0 warnings.
- `npm run build` (`tsc -b && vite build`): Succeeded in 579ms, generated clean `dist/` bundle.
- Verified keyboard navigation, ARIA roles, and responsive layouts.

### Final Status:
**GREEN (APPROVED)**

---

## Task 2: yt-dlp Engine + Real Backend API

- **Date**: 2026-09-27
- **Reviewer Agent**: Task 2 Review Agent (Security Engineer & Backend Reviewer)
- **Target**: `server/` (FastAPI + Python 3.14 + native yt-dlp 2026.08.19 + FFmpeg 8.1.1)

### Issues Found:
1. **SSRF Bypass via Embedded Credentials**: URLs with `user:pass@host` bypassed scheme checks.
2. **SSRF Decimal & Hex IPv4 Masking**: Integer representations (e.g. `http://2130706433/` for `127.0.0.1`) were masked by improper exception catching (`ValueError` caught `SSRFBlockedError`).
3. **Dangerous Port SSRF Risk**: Arbitrary internal management ports (21, 22, 23, 25, 53, 6379, 11211, etc.) were unvalidated.
4. **Missing yt-dlp Timeouts**: Omitted `socket_timeout` and per-request execution timeout, risking thread starvation.
5. **Vertical Video & Non-Standard Resolution Discarding**: YouTube Shorts / TikTok formats (1920x1080 vertical) and non-standard resolutions (540p, 240p) failed standard landscape tier checks.
6. **Multiple Recommended Badges**: Incremental evaluation allowed multiple formats to simultaneously hold `is_recommended = True`.
7. **Unbounded Concurrency & Inaccurate Health Counter**: Concurrency limit wasn't enforced and active jobs reported static 0.
8. **Windows Reserved Device Names**: Filename sanitization lacked protection against Windows reserved names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`).

### Issues Fixed:
- Enforced embedded credentials rejection in `server/app/core/security.py`.
- Added decimal/hex IP parsing and blocked dangerous management ports in `security.py`.
- Added Windows reserved device names check prefixing `truetube_` in `sanitize_filename`.
- Configured `socket_timeout: 15` and 30-second execution threadpool timeout in `ytdlp_service.py`.
- Implemented vertical video resolution normalization (`min(height, width)`), expanded resolution tiers, and preserved custom resolutions.
- Enforced single recommended quality badge per media item (preferring 1080p Full HD or top resolution).
- Implemented thread-safe `ConcurrencyLimiter` using semaphores in `routes.py` and updated `GET /api/health` with dynamic active jobs count.

### Tests Executed:
- Pytest suite: 16 test cases in `server/tests/test_analyzer.py` — 16 passed in 0.73s (100% pass rate).
- Live server test in `server/tests/live_test.py`: Tested `GET /`, `GET /api/health`, and 6 security attack vectors against live running Uvicorn server on port 8999 with 100% success.
- Real YouTube extraction test: Successfully extracted 4K metadata for Blender Open Movie.

### Final Status:
**GREEN (APPROVED)**
