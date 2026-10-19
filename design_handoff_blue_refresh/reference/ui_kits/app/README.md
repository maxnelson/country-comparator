# UI kit — Country Comparator app

A click-through recreation of the single-screen app (`src/App.jsx` → Header, ComparisonTable, Footer, Picker), composed from the design-system components.

- `index.html` — entry; toggle Phone (390) / Desktop (1280).
- `App.jsx` — app shell and state (countries, metrics, Edit mode, picker).
- `metrics.js` — port of `src/data/metrics.js` formatting.
- `countries.js` — 40 of the 201 countries from `src/data/countries.json` (real values).

Interactions: + adds a country (sheet on phone, anchored popover on desktop), Add metric adds a row, Edit shows grips and remove buttons, Done exits. Drag-reorder is not simulated.
