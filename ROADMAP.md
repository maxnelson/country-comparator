# Country Comparator — Roadmap

Living plan for the project. Work is grouped into phases; within a phase, items are in rough priority order. Tick items off as they ship. Raw ideas go in the **Inbox** at the bottom until they are sorted into a phase. Decisions that shape the project are logged in the **Decisions** table so future sessions know why things are the way they are.

Last updated: 2026-10-15

---

## Vision

A fast, mobile-first quick-reference tool for comparing countries side by side. The primary use case is someone pulling it up on their phone to settle a question in seconds. It must also work in a desktop browser at a plain URL, and every comparison should be shareable by link.

## Product principles

- **Mobile first.** Design for a ~390px screen, then widen for tablet and desktop.
- **Instant.** Static, cached, no spinners for core data. Repeat visits open offline.
- **Shareable.** Every comparison has a URL. Links are the growth engine.
- **One codebase.** The web app serves desktop, phone browser, and the installed home-screen app.

---

## Decisions

| # | Decision | Status | Notes |
|---|----------|--------|-------|
| D1 | **Platform:** mobile-first Progressive Web App (PWA) built from the existing React + Vite app. Store listings later via a Capacitor wrapper if wanted. | Proposed, recommended by Claude, awaiting owner confirmation | Alternatives evaluated: native Swift, React Native / Expo. See *Platform evaluation* below. |
| D2 | **Hosting:** static deploy on every push to `main` via GitHub Actions (GitHub Pages first; Vercel/Netlify/Cloudflare are drop-in alternatives). Retire the App Engine config. | Proposed | Needed so changes can be tested on a phone minutes after they ship. |
| D3 | **Branching:** small, self-contained changes on short-lived branches with a PR; CI (lint, build, tests) must be green before merge. | Proposed | PR descriptions and screenshots are phone-readable; diffs are not. |

---

## Phase 0 — Foundations (make phone-driven development work)

- [ ] `CLAUDE.md`: project context, conventions, how to verify a change, workflow rules
- [ ] `README.md`: what the app is, how to run it, how it deploys
- [ ] GitHub Action: lint + build (+ tests) on every PR and push to `main`
- [ ] Auto-deploy to a public URL on push to `main` (D2)
- [ ] SessionStart hook so cloud sessions install dependencies automatically
- [ ] Minimal test setup (Vitest + React Testing Library) with one smoke test
- [ ] Remove `app.yaml` and `.gcloudignore` once D2 is confirmed

## Phase 1 — Mobile-first PWA shell (D1)

- [ ] Rework the layout so the phone view is the default and desktop is the enhancement. Today the third country and the "Add country" button are off-screen on a phone.
- [ ] Web app manifest: name, short name, icons, theme color, `display: standalone`
- [ ] Service worker for offline use and instant repeat loads (e.g. `vite-plugin-pwa`)
- [ ] App icons and splash assets for iOS and Android
- [ ] "Add to Home Screen" hint for iOS users (Safari never prompts on its own)
- [ ] Mobile ergonomics: 44px touch targets, safe-area insets, sticky header, no layout jank
- [ ] Verify on a real iPhone and a real Android phone via the deployed URL

## Phase 2 — Core comparison UX

- [ ] Country picker with search (replaces "add the next country in the list")
- [ ] Remove and reorder countries
- [ ] Metric picker: choose, hide, reorder; remember choices on the device
- [ ] Put the comparison state in the URL (countries + metrics) so any view is shareable
- [ ] Highlight the best / worst value in each row
- [ ] Sensible first-run and empty states

## Phase 3 — Real data

- [ ] Choose data sources (candidates: World Bank API, REST Countries, UN data, CIA World Factbook) and check licensing
- [ ] Decide bundled build-time JSON (fast, offline, simplest) vs runtime fetching
- [ ] Data refresh script; record source and year for every metric
- [ ] Expand from 8 sample countries to all ~195
- [ ] Methodology and Data Sources pages (currently dead footer links)

## Phase 4 — Growth

- [ ] Pre-rendered per-comparison pages for search engines (e.g. `/united-states-vs-japan`)
- [ ] Open Graph share images so links unfurl nicely in messages and social
- [ ] Share button using the native share sheet on mobile
- [ ] Privacy-friendly analytics
- [ ] Remaining footer pages: About, FAQ, Privacy, Contact

## Later / ideas (not scheduled)

- Capacitor wrapper to list on the App Store and Play Store (reuses the web build; needs an Apple Developer account and a macOS or cloud build step)
- iOS home-screen widgets (native-only; would ride on the Capacitor wrapper)
- Dark mode
- Charts and historical trends per metric
- Unit toggle (imperial / metric) and localisation
- Accounts and saved comparisons

---

## Inbox (unsorted brain-dump items)

Add raw ideas here. They get sorted into a phase during planning.

- _(empty)_

---

## Platform evaluation (background for D1)

Evaluated on 2026-10-15 against the project's real constraints: a solo developer working mostly from a phone, through Claude Code cloud sessions running on Linux, who needs the app on iPhone, Android, and desktop browsers.

| | 1a. Native Swift | 1b. React Native / Expo | 1c. Mobile-first PWA |
|---|---|---|---|
| Platforms | iPhone only | iOS + Android (+ web via react-native-web) | Desktop, iOS, Android, one codebase |
| Desktop URL | Needs a separate web app | Second-class web output | Native to the approach |
| Build / test loop from a phone | Needs Xcode on a Mac or a cloud macOS build, then TestFlight; 15–30 min per iteration; Claude cannot run or screenshot it | Expo cloud builds and OTA updates make it possible but heavier; dev server to phone needs a tunnel | Push → auto-deploy → open URL; Claude screenshots every change |
| Distribution | App Store review per release | Two store reviews per release | Instant; no review |
| Install feel | Best | Good | Icon on home screen, full-screen, offline; iOS install is a manual Share → Add to Home Screen |
| Shareable links / SEO | No | Weak | Yes, and this is how a reference tool spreads |
| Smoothness for this UI | Best | Very good | Indistinguishable for a data-table UI; gap only shows in gesture-heavy apps |
| Widgets | Yes | Partial | No (needs native wrapper) |
| Reuses current code | No | Partially | Entirely |

**Recommendation:** 1c now. It is the only option whose full loop works from the train, it meets the desktop + phone requirement with one codebase, and it keeps the door to the stores open through a later Capacitor wrapper rather than closing it.

---

## How we work (phone-commute workflow)

- One task per prompt, sized to a train ride. "Add a searchable country picker" is the right size.
- Every task ends with lint, build and tests green, a desktop and phone screenshot, a commit, and a push.
- Prompts should say "decide and proceed" where possible; questions block while the owner is offline.
- New ideas go in the Inbox. Decisions go in the Decisions table. Ticks go on the phase lists.
