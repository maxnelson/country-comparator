# Country Comparator

Compare countries side by side. A mobile-first web app meant to be pulled up on a phone to settle a question in seconds, and to work just as well in a desktop browser.

**Live:** https://maxnelson.github.io/country-comparator/

Status: early prototype. The eight countries and twenty metrics are sample data; real sources come later (see the roadmap).

Every comparison is a link. The countries, metrics and their order live in the query string, for example `?c=FR,CA&m=capital,currency`, so the URL in the address bar can be shared as is.

## Develop

Requires Node 22.

```
npm install
npm run dev        # http://localhost:5173
npm run lint
npm test
npm run build      # static output in dist/
```

## Deploy

Every push to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`, which lints, tests, builds and publishes `dist/` to GitHub Pages. There is nothing to deploy by hand.

## Plan

`ROADMAP.md` holds the vision, the decisions log and the phased task list. `CLAUDE.md` holds working notes for Claude Code sessions.
