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
| D5 | **Data:** ships as a committed JSON built by `npm run data:refresh` (no runtime fetching), from the World Bank Indicators API (CC BY 4.0) for numbers and mledoze/countries (ODbL 1.0) for the catalog; CIA World Factbook (public domain) next for median age and coastline. Wikidata (CC0) is the fallback for the catalog if ODbL share-alike ever matters. The Factbook is a frozen archive since the CIA ended it in February 2026; its fields will need a living source eventually (UN World Population Prospects for median age and fertility). | Confirmed 2026-10-18 | Dropped for now: public debt (World Bank series sparse and decades stale), tourist arrivals (series ends in the 2020 pandemic year), average temperature, UNESCO sites, top income tax rate (no clean source yet). |
| D6 | **PWA shell:** `vite-plugin-pwa` with a Workbox service worker that precaches the whole build, data included, so the app opens offline. Update strategy is `autoUpdate`: a new deploy installs in the background and the page reloads itself, which loses nothing because all state is in the URL. Home-screen name "Countries"; icon is two bars on the header teal, drawn in `scripts/make-icons.mjs`. | Confirmed 2026-10-18 | The alternative, a "new version available" prompt, is more UI for no gain here. Short name because iOS truncates labels at about 12 characters. |
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
- [x] Web app manifest: name, short name ("Countries" on the home screen), icons, theme color, `display: standalone`
- [x] Service worker for offline use and instant repeat loads (`vite-plugin-pwa`; the whole build is precached and a new deploy reloads the page, see D6)
- [x] App icons for iOS and Android (favicon, Android any and maskable, iOS touch icon, all drawn by `scripts/make-icons.mjs`). Android builds its splash from the manifest colours; iOS shows a plain launch screen unless per-device startup images are added later
- [x] "Add to Home Screen" hint for iOS users (Safari never prompts on its own): a banner under the header, iOS browsers only, hidden once installed; Dismiss snoozes it for 30 days
- [x] Mobile ergonomics: 44px touch targets, safe-area insets, sticky header, no layout jank
- [ ] Verify on a real iPhone and a real Android phone via the deployed URL

## Phase 2 — Table interaction (D4)

- [x] Frozen-panes table: horizontal scroll with minimum column widths; flag header row pinned top, metric labels pinned left, add-country button pinned top-right, add-metric row pinned bottom. One scroll container for the whole page; header and footer stay put sideways.
- [x] Country picker: search input with an autocomplete list; bottom sheet on phones, popover on desktop; matches partial names, codes and aliases; arrow keys and Enter; replaces "add the next country"
- [x] Metric picker reusing the same component (lists the metrics not yet shown)
- [x] Edit mode: an Edit/Done toggle in the pinned bottom toolbar reveals remove buttons on columns and rows; at least one country and one metric stay
- [x] Drag to reorder rows in Edit mode (dnd-kit): grip handle at the right of each row, short hold on touch, keyboard with Space and arrows, auto-scroll near the edges
- [x] Drag to reorder columns in Edit mode: grip at the top-left of each flag; the whole column (header and values) moves together
- [x] Put the comparison state in the URL (countries, metrics, order) so any view is shareable: `?countries=fr-ca&metrics=capital-currency`; both parameters are always written, so the bare URL becomes the default comparison; the tab title names the countries
- [ ] Sensible first-run and empty states

## Phase 3 — Real data (D5)

- [x] Choose data sources and check licensing: World Bank (CC BY 4.0) + mledoze/countries (ODbL 1.0)
- [x] Bundled build-time JSON, committed to the repo
- [x] Data refresh script (`scripts/fetch-data.mjs`); every World Bank value carries the year it was reported for
- [x] All 201 countries and territories (UN members, independents, plus Taiwan, Kosovo, Palestine, Hong Kong, Macao, Puerto Rico, Greenland)
- [x] CIA World Factbook (public domain) for median age and coastline, plus urban population, fertility rate, infant mortality, physician density, highest point, airports, Gini index, inflation, GDP growth, military spending as % of GDP, electricity access and government type. The CIA stopped publishing it in February 2026, so these come from the final edition and will not refresh.
- [ ] Show the data year somewhere discreet (values range from 2021 to 2025 depending on the series)
- [ ] Methodology and Data Sources pages (currently dead footer links), with the attribution each license asks for
- [ ] Monthly refresh via a scheduled GitHub Action that opens a commit when data changed

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
- The data JSON is bundled into the main script (about 32 KB gzipped). Lazy-load it if the bundle keeps growing.
- In the installed app the iOS status bar is the opaque default. If it looks wrong on a real iPhone, switch to `black-translucent` and pad the header and the pinned table header by `env(safe-area-inset-top)`.
- Factbook-derived metrics are frozen at the final 2025/2026 edition. Replace median age and fertility with UN World Population Prospects (CC BY 3.0 IGO) when they start to feel stale.

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
