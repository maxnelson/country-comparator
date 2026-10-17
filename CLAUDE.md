# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Country Comparator: a mobile-first web app for comparing countries side by side. Early prototype on sample data. Live at https://maxnelson.github.io/country-comparator/. The plan, decisions log and task checklist live in `ROADMAP.md`; read it before starting work and tick items off as they ship.

## Commands

```
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

- `src/App.jsx` composes `Header`, `ComparisonTable` and `Footer`. `ComparisonTable` owns all application state (which countries are shown, how many metrics are visible) and renders both the table and the Add country / Add metric action bar.
- Data is static in `src/data/`. `sampleCountries.js` exports `SAMPLE_COUNTRIES`, an array of `{ code, name, flag, metrics }` with `metrics` keyed by metric key. `sampleMetrics.js` exports `SAMPLE_METRICS`, an ordered list of `{ key, label, format, formatCompact? }`; `format` turns a raw value into display text and returns "—" for null or undefined, and the optional `formatCompact` is a shorter string ("333.3M") for narrow columns. The array order is the display order, and `DEFAULT_VISIBLE_METRIC_COUNT` sets how many show before "Add metric". Real data sources are a Phase 3 roadmap item.
- The comparison is ARIA-role divs, not a `<table>`. Each row is its own CSS grid sharing one column template (`--cols`, built from `--col-count`), so columns line up across rows. Mobile-first: the metric label spans the row above the values, the flag header row is sticky, and the action bar sticks to the bottom; at 768px and up the label becomes a left column, the table becomes a card and the action bar becomes a toolbar above it. `data-density` (from the column count) steps type size down and switches cells to their compact strings. No ancestor of the table may set `overflow`, or the sticky header stops working.
- Styling is CSS Modules per component plus design tokens in `src/styles/tokens.css`. Palette scales (`--mint-*`, `--teal-*`, `--gray-*`) are raw colors; components use the semantic tokens (`--color-*`, `--space-*`, `--font-*`, `--layout-*`). Re-theme by changing semantic tokens, not the palette or the components.

## Deployment and base path

Every push to `main` runs `.github/workflows/deploy.yml`: lint, test, build, then publish `dist/` to GitHub Pages. The site is served under `/country-comparator/`, so:

- `vite.config.js` reads `BASE_PATH`; the workflow sets it from `actions/configure-pages`. Locally it defaults to `/`.
- Public assets referenced from JSX must use `import.meta.env.BASE_URL` (see `Footer.jsx` and `Header.jsx`). Vite rewrites absolute URLs in `index.html` automatically, but not string literals in JS.
- GitHub Pages has no SPA fallback. If client-side routes are ever added, use query parameters or a `404.html` redirect.

## Tooling notes

- ESLint flat config in `eslint.config.js`: browser globals everywhere except `*.config.js`, which get Node globals. `no-unused-vars` ignores identifiers starting with a capital letter or underscore.
- Vitest runs in jsdom with `src/test/setup.js` (jest-dom matchers and Testing Library cleanup). CSS Modules resolve to a proxy in tests, so do not assert on class names.
- Cloud sessions have Playwright and Chromium preinstalled: resolve `playwright` from `$(npm root -g)` and launch with `executablePath: '/opt/pw-browsers/chromium'`. Serve `dist/` with `npm run preview` and screenshot at 1280×900 and 390×844.

## How work happens here

The owner develops mostly from a phone through cloud sessions, so these rules matter more than usual:

- Work directly on `main`. No branches or PRs unless asked.
- Every task ends with lint, test and build green, a desktop and a phone (390px) screenshot sent to the owner, a commit and a push. The deploy takes about a minute; say when it is live.
- Decide and proceed on routine judgment calls and state the assumption. Questions block while the owner is on a train.
- Keep messages short and lead with the outcome; they are read on a phone.
- When a roadmap item ships, tick it in `ROADMAP.md`. Record decisions in its Decisions table and raw ideas in its Inbox.
- Size tasks to one train ride: one coherent change per prompt.
