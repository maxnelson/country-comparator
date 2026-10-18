# Country Comparator

Compare countries side by side. A mobile-first web app meant to be pulled up on a phone to settle a question in seconds, and to work just as well in a desktop browser.

**Live:** https://maxnelson.github.io/country-comparator/

Status: early prototype with real data for 201 countries and territories.

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

Values are stored in source units (km², USD); `src/data/metrics.js` converts for display.

## Deploy

Every push to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`, which lints, tests, builds and publishes `dist/` to GitHub Pages. There is nothing to deploy by hand.

## Plan

`ROADMAP.md` holds the vision, the decisions log and the phased task list. `CLAUDE.md` holds working notes for Claude Code sessions.
