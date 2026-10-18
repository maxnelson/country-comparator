# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Country Comparator: a mobile-first web app for comparing countries side by side. Early prototype on sample data. Live at https://maxnelson.github.io/country-comparator/. The plan, decisions log and task checklist live in `ROADMAP.md`; read it before starting work and tick items off as they ship.

## Commands

```
npm run data:refresh                          # rebuild src/data/countries.json from the sources (network)
npm install                                   # dependencies (the SessionStart hook does this in cloud sessions)
npm run dev                                   # Vite dev server
npm run lint                                  # ESLint over the whole repo (CI runs this)
npm test                                      # Vitest, single run (CI runs this)
npm run test:watch                            # Vitest in watch mode
npx vitest run src/App.test.jsx               # one test file
npx vitest run -t "adds the next country"     # one test by name
npm run build                                 # production build to dist/
BASE_PATH=/country-comparator/ npm run build  # build exactly as the deploy does
npm run preview                               # serve dist/ (honours BASE_PATH)
```

## Architecture

Single-page React 19 app built with Vite 8. No router and no backend; the build output is static files.

- `src/App.jsx` composes `Header`, `ComparisonTable` and `Footer` inside the page's only scroll container (`.scroller` in `App.module.css`); the document itself never scrolls (`body { overflow: hidden }`). Header and footer are `position: sticky; left: 0`, so they scroll away vertically but never sideways. `ComparisonTable` owns all application state: `activeCodes` and `activeMetricKeys` (ordered lists of what is shown; order is display order), and `editing` for Edit mode. The two lists start from the query string and are written back to it with `history.replaceState` on every change (`src/state/urlState.js`: `parseSearch`, `buildSearch`, `titleFor`; parameters `countries` and `metrics`, hyphen-separated, codes written lowercase, always written so the bare URL is replaced by the default comparison on load; unknown ids dropped, empty lists fall back to the defaults; the earlier `c`/`m` comma format is still read). `document.title` names the countries. Tests that touch the URL reset it in `afterEach` because the jsdom window is shared.
- Data is a generated file, `src/data/countries.json`, built by `scripts/fetch-data.mjs` (`npm run data:refresh`; needs network) from the World Bank Indicators API and mledoze/countries. Never hand-edit it. `src/data/countries.js` exports `COUNTRIES` (sorted by name; each `{ code, code3, name, official, flag, region, subregion, aliases, metrics, years }` with `metrics` in source units, km² and USD, and `years` giving the year each World Bank value was reported for; a missing value is `null`). `src/data/metrics.js` exports `METRICS`, an ordered list of `{ key, label, source?, convert?, format }`: `key` is the stable id used in URLs, `source` the data key when it differs, `convert` the display-unit conversion, and `format` returns "—" for null. Use `metricValue(metric, country)` rather than reading `country.metrics` directly. `DEFAULT_VISIBLE_METRIC_COUNT` sets how many metrics show initially. Adding a World Bank metric means adding its indicator code to `INDICATORS` in the script, re-running it, and adding a definition to `METRICS`.
- The comparison is ARIA-role divs, not a `<table>`. It is one CSS grid: `repeat(--col-count, minmax(min-content, 1fr))` value tracks plus a fixed add-column track, and a fixed 220px label track at 768px and up; each row is a `subgrid`, so columns align while rows keep their own borders. `width: min-content; min-width: 100%` makes columns share the viewport when they fit and the table scroll sideways when they don't; value cells carry `min-width: var(--col-min)` as the floor and never shrink below it. Frozen panes are all `position: sticky` against the page scroller: header row (top), metric labels (left; on phones the label spans the row and only its text pins), the add-country lane (right: the header's add cell plus a transparent `.lane` cell in every data row; nothing in the lane has a border or background, so the plus button and the row delete buttons float and a dragged column's tint shows through), add-metric row (bottom). Vertical padding lives in the cells, not the rows, so pinned cells stretch to the full row height and their borders run unbroken; rows carry only the left gutter (`--layout-gutter`, which also sets `--pane-pad` so labels align with the header text). Cells are placed explicitly with `--i` and `--value-col-start` because the phone layout puts labels on their own grid row. The last row is a pinned toolbar: Add metric (left) and Edit/Done (right). Edit mode (`data-editing` on the table) renders red delete buttons (in the right lane for rows, top-right of the flag for columns) and grip handles (before the label text for rows, top-left of the flag for columns). Two separate dnd-kit `DndContext`s: metric rows (`MetricRow`, vertical strategy) and country header cells (`CountryHeader`, horizontal strategy), both with `restrictToParentElement` so a drag can never create phantom overflow that auto-scroll would chase. The handle is the drag activator, so the rest of the row or cell still scrolls. A column is one header cell plus a value cell per row; the header cell is the sortable item and mirrors its `transform`, `transition` and a tint onto its value cells through `--col-transform-N`, `--col-transition-N` and `--col-bg-N` custom properties set on the table element, which the value cells read in their inline style. Sensors: mouse after 4px, touch after a 150ms hold, keyboard (Space lifts, arrows move, Space drops). The pure reorder helper is `reorder.js`. A dragged row or header cell gets `data-dragging` and `z-index: 2`, between the pinned label cells (1) and the pinned header and toolbar rows (3). Nothing between the scroller and the table may set `overflow` other than `visible` or `clip`, or the pinning breaks, and the table must stay full-bleed: a side gutter lets values show through beside the pinned labels.
- `src/components/Picker/` is the searchable picker used to add countries and metrics. It is built on the native `<dialog>` with `showModal()`, so it renders in the top layer above the pinned table parts and traps focus. It is opened imperatively (`pickerRef.current.open(anchorElement)`) from inside the click handler so phones show the keyboard. Phones get a bottom sheet sized to `window.visualViewport` so it stays above the keyboard; 768px and up get a popover anchored to the opening button (below it when there is room, otherwise above; left-aligned when there is room, otherwise right-aligned). Items are `{ id, label, leading?, hint?, keywords? }`; ranking lives in `filter.js` (label prefix, then exact alias, word prefix, alias prefix, substring; case- and accent-insensitive) and has its own unit tests.
- Styling is CSS Modules per component plus design tokens in `src/styles/tokens.css`. Palette scales (`--mint-*`, `--teal-*`, `--gray-*`) are raw colors; components use the semantic tokens (`--color-*`, `--space-*`, `--font-*`, `--layout-*`). Re-theme by changing semantic tokens, not the palette or the components.

## Deployment and base path

Every push to `main` runs `.github/workflows/deploy.yml`: lint, test, build, then publish `dist/` to GitHub Pages. The site is served under `/country-comparator/`, so:

- `vite.config.js` reads `BASE_PATH`; the workflow sets it from `actions/configure-pages`. Locally it defaults to `/`.
- Public assets referenced from JSX must use `import.meta.env.BASE_URL` (see `Footer.jsx` and `Header.jsx`). Vite rewrites absolute URLs in `index.html` automatically, but not string literals in JS.
- GitHub Pages has no SPA fallback. If client-side routes are ever added, use query parameters or a `404.html` redirect.

## Tooling notes

- ESLint flat config in `eslint.config.js`: browser globals everywhere except `*.config.js`, which get Node globals. `no-unused-vars` ignores identifiers starting with a capital letter or underscore.
- Vitest runs in jsdom with `src/test/setup.js` (jest-dom matchers, Testing Library cleanup, and polyfills for `dialog.showModal/close` and `scrollIntoView`, which jsdom lacks). CSS Modules resolve to a proxy in tests, so do not assert on class names. A closed `<dialog>` is still in the DOM in jsdom, so assert on its `open` attribute rather than its absence. dnd-kit runs in jsdom (it guards the missing `ResizeObserver`) but real drags cannot be simulated there: test `moveItem` and the handles, and verify drags with Playwright against the preview (move to the handle, mouse down, move past 4px, move in steps, mouse up).
- Cloud sessions have Playwright and Chromium preinstalled: resolve `playwright` from `$(npm root -g)` and launch with `executablePath: '/opt/pw-browsers/chromium'`. Serve `dist/` with `npm run preview` and screenshot at 1280×900 and 390×844. The document does not scroll, so `fullPage` captures only the viewport; to capture a scrolled state call `scrollTo` on the scroller (`document.querySelector('main').parentElement`).

## How work happens here

The owner develops mostly from a phone through cloud sessions, so these rules matter more than usual:

- Work directly on `main`. No branches or PRs unless asked.
- Every task ends with lint, test and build green, a desktop and a phone (390px) screenshot sent to the owner, a commit and a push. The deploy takes about a minute; say when it is live.
- Decide and proceed on routine judgment calls and state the assumption. Questions block while the owner is on a train.
- Keep messages short and lead with the outcome; they are read on a phone.
- When a roadmap item ships, tick it in `ROADMAP.md`. Record decisions in its Decisions table and raw ideas in its Inbox.
- Size tasks to one train ride: one coherent change per prompt.
