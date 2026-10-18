# Country Comparator

Compare countries side by side. A mobile-first web app meant to be pulled up on a phone to settle a question in seconds, and to work just as well in a desktop browser.

**Live:** https://maxnelson.github.io/country-comparator/

Status: early prototype with real data for 201 countries and territories.

It installs as an app: open the site, then pick **Add to Home Screen** from the browser's share menu (iPhone) or **Install app** from the browser menu (Android, desktop Chrome). After the first load it works offline, and new versions apply on their own.

Every comparison is a link. The countries, metrics and their order live in the query string, for example `?countries=fr-ca&metrics=capital-currency`, so the URL in the address bar can be shared as is.

## Develop

Requires Node 22.

```
npm install
npm run dev        # http://localhost:5173
npm run lint
npm test
npm run build      # static output in dist/
```

## Data

`src/data/countries.json` is generated, not hand-edited. `npm run data:refresh` rebuilds it from:

| Source | Used for | License |
|---|---|---|
| [World Bank Open Data](https://data.worldbank.org) (Indicators API) | population, area, GDP, GDP per capita, life expectancy, population density, internet users, unemployment, literacy, CO₂ per capita, military spending; the most recent reported value and its year | CC BY 4.0 |
| [mledoze/countries](https://github.com/mledoze/countries) | names, ISO codes, flags, capitals, currencies, regions, alternative spellings for search | ODbL 1.0 |
| [CIA World Factbook](https://github.com/factbook/factbook.json), final edition via the factbook.json archive | median age, coastline, urban population, fertility rate, infant mortality, physician density, highest point, airports, Gini index, inflation, GDP growth, military spending as % of GDP, electricity access, government type | Public domain |
| [datasets/country-codes](https://github.com/datasets/country-codes) | mapping from ISO codes to the Factbook's own country codes | Public domain |

The CIA stopped publishing the World Factbook in February 2026. Its values here come from the final edition (mostly 2024 and 2025 estimates) and will not refresh; everything else refreshes from the World Bank.

Values are stored in source units (km², USD, m); `src/data/metrics.js` converts for display.

## Deploy

Every push to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`, which lints, tests, builds and publishes `dist/` to GitHub Pages. There is nothing to deploy by hand.

## Plan

`ROADMAP.md` holds the vision, the decisions log and the phased task list. `CLAUDE.md` holds working notes for Claude Code sessions.
