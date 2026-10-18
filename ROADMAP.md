# Country Comparator — Roadmap

Living plan for the project. Work is grouped into phases; within a phase, items are in rough priority order. Tick items off as they ship. Raw ideas go in the **Inbox** at the bottom until they are sorted into a phase. Decisions that shape the project are logged in the **Decisions** table so future sessions know why things are the way they are.

Last updated: 2026-10-18

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
| D1 | **Platform:** mobile-first Progressive Web App (PWA) built from the existing React + Vite app. Native app versions may follow later and will build on the finished web app. | Confirmed 2026-10-16 | Alternatives evaluated: native Swift, React Native / Expo. See *Platform evaluation* below. |
| D2 | **Hosting:** static deploy on every push to `main` via GitHub Actions. Recommended: GitHub Pages to start (no new accounts; one toggle in repo settings), moving to Cloudflare Pages or Firebase Hosting when the app launches publicly or needs branch previews. Retire the App Engine config. | Confirmed 2026-10-16 | Live at https://maxnelson.github.io/country-comparator/. The app is a static site after `vite build`, so any static host works and switching later is cheap. See *Hosting evaluation* below. |
| D3 | **Branching:** work directly on `main`. CI runs on every push. Branches only when the owner asks for one or when more than one person is working in the repo. | Confirmed 2026-10-16 | Solo project; PR overhead is not worth it from a phone. |
| D4 | **Table interaction model:** frozen-panes grid (horizontal scroll with minimum column widths; pinned header row, label column, add-country button and add-metric row), search-based pickers in a bottom sheet / popover, and an Edit mode for remove and drag-reorder. | Confirmed 2026-10-17 | Owner's proposal, refined in discussion. Replaced the fit-to-width layout and compact-number tiers from Phase 1. |

---

## Phase 0 — Foundations (make phone-driven development work)

- [x] Hosting pipeline (D2): GitHub Action that lints, builds, and publishes the site to a public URL on every push to `main`
- [x] `CLAUDE.md`: project context, conventions, how to verify a change, workflow rules
- [x] `README.md`: what the app is, how to run it, how it deploys
- [x] SessionStart hook so cloud sessions install dependencies automatically
- [x] Minimal test setup (Vitest + React Testing Library) with one smoke test, run in CI
- [x] Remove `app.yaml` and `.gcloudignore`

## Phase 1 — Mobile-first PWA shell (D1)

- [x] Rework the layout so the phone view is the default and desktop is the enhancement (metric rows with one label, sticky flag header; the bottom action bar and compact-number tiers were later replaced by the Phase 2 frozen-panes table)
- [ ] Web app manifest: name, short name, icons, theme color, `display: standalone`
- [ ] Service worker for offline use and instant repeat loads (e.g. `vite-plugin-pwa`)
- [ ] App icons and splash assets for iOS and Android
- [ ] "Add to Home Screen" hint for iOS users (Safari never prompts on its own)
- [x] Mobile ergonomics: 44px touch targets, safe-area insets, sticky header, no layout jank
- [ ] Verify on a real iPhone and a real Android phone via the deployed URL

## Phase 2 — Table interaction (D4)

- [x] Frozen-panes table: horizontal scroll with minimum column widths; flag header row pinned top, metric labels pinned left, add-country button pinned top-right, add-metric row pinned bottom. One scroll container for the whole page; header and footer stay put sideways.
- [x] Country picker: search input with an autocomplete list; bottom sheet on phones, popover on desktop; matches partial names, codes and aliases; arrow keys and Enter; replaces "add the next country"
- [ ] Metric picker reusing the same component (lists the metrics not yet shown)
- [ ] Edit mode: remove buttons and drag handles on rows and columns; drag to reorder rows (dnd-kit), then columns
- [ ] Put the comparison state in the URL (countries, metrics, order) so any view is shareable
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

- Native app versions (Capacitor wrapper first, since it reuses the web build; needs an Apple Developer account and a macOS or cloud build step)
- iOS home-screen widgets (native-only; would ride on the native wrapper)
- Dark mode
- Charts and historical trends per metric
- Unit toggle (imperial / metric) and localisation
- Accounts and saved comparisons

---

## Inbox (unsorted brain-dump items)

Add raw ideas here. They get sorted into a phase during planning.

- Cap how wide value columns grow on very wide screens; with three countries on a 1920px display each column is over 500px.

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

**Outcome:** 1c, confirmed by the owner on 2026-10-16.

## Hosting evaluation (background for D2)

The built app is three static files (HTML, JS, CSS) plus a favicon. There is no server code, so the host only needs to serve files over HTTPS from a CDN and rebuild on every push.

| | GitHub Pages | Cloudflare Pages | Firebase Hosting | App Engine (current config) |
|---|---|---|---|---|
| Setup from a phone | One toggle in repo settings; Claude commits the workflow | Create account, connect GitHub, pick repo | GCP console, service-account key into GitHub secrets | Service-account key into GitHub secrets |
| Cost | Free (public repos) | Free, unlimited bandwidth | Free tier, then pay-as-you-go | Free tier of instance-hours, then pay |
| Deploy time after push | ~1 min | ~1 min | ~1 min | Several minutes |
| Branch preview URLs | No | Yes | Yes (channels) | Yes (versions), clunky |
| Custom domain + HTTPS | Yes | Yes | Yes | Yes |
| Commercial use | Discouraged by terms | Allowed | Allowed | Allowed |
| Fit for a static site | Good | Excellent | Excellent | Poor: a Python runtime serving files |

**Recommendation:** GitHub Pages now, because it needs no new accounts and the only manual step is one toggle. Move to Cloudflare Pages or Firebase Hosting when the app launches publicly or needs branch previews; for a static site that move is under an hour. App Engine is retired. If a backend is ever needed, Cloud Run or Cloud Functions on GCP pair fine with a static front-end on any of these hosts.

---

## How we work (phone-commute workflow)

- Work directly on `main` (D3). Every task ends with a commit and a push.
- One task per prompt, sized to a train ride. "Add a searchable country picker" is the right size.
- Every task ends with lint, build and tests green, and a desktop and phone screenshot.
- Prompts should say "decide and proceed" where possible; questions block while the owner is offline.
- New ideas go in the Inbox. Decisions go in the Decisions table. Ticks go on the phase lists.
