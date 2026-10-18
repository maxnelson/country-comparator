#!/usr/bin/env node
// Builds src/data/countries.json from public sources. Run with `npm run data:refresh`.
//
// Sources
//   World Bank Indicators API (CC BY 4.0): the numeric metrics, most recent
//     non-empty value per economy, with the year it was reported for.
//   mledoze/countries (ODbL 1.0): the catalog — names, ISO codes, capitals,
//     currencies, regions and alternative spellings used for search.
//
// Values are stored in source units (km², USD); display conversions live in
// src/data/metrics.js so the data stays honest and units can be toggled later.

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/countries.json')
const WB = 'https://api.worldbank.org/v2'
const CATALOG_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'

// metric data key -> World Bank indicator code
const INDICATORS = {
  population: 'SP.POP.TOTL',
  area_km2: 'AG.SRF.TOTL.K2',
  gdp_usd: 'NY.GDP.MKTP.CD',
  gdp_per_capita: 'NY.GDP.PCAP.CD',
  life_expectancy: 'SP.DYN.LE00.IN',
  pop_density_km2: 'EN.POP.DNST',
  internet_pct: 'IT.NET.USER.ZS',
  unemployment_pct: 'SL.UEM.TOTL.ZS',
  literacy_pct: 'SE.ADT.LITR.ZS',
  co2_per_capita: 'EN.GHG.CO2.PC.CE.AR5',
  military_spending_usd: 'MS.MIL.XPND.CD',
}

// Not UN members / not independent in the catalog, but expected by users
const EXTRA_CODES = new Set(['TW', 'XK', 'PS', 'HK', 'MO', 'PR', 'GL'])
// Catalog uses UNK for Kosovo; the World Bank uses XKX
const ISO3_TO_WB = { UNK: 'XKX' }

// Colloquial names the catalog's altSpellings do not cover
const EXTRA_ALIASES = {
  US: ['America', 'USA'],
  GB: ['UK', 'Britain', 'England', 'Scotland', 'Wales', 'Great Britain'],
  NL: ['Holland'],
  CZ: ['Czech Republic'],
  MM: ['Burma'],
  TR: ['Turkey', 'Türkiye'],
  CI: ['Ivory Coast'],
  CD: ['DRC', 'Congo-Kinshasa', 'Zaire'],
  CG: ['Congo-Brazzaville'],
  SZ: ['Swaziland'],
  MK: ['Macedonia'],
  TL: ['East Timor'],
  CV: ['Cape Verde'],
  IR: ['Persia'],
  KR: ['Korea', 'ROK'],
  KP: ['DPRK'],
  AE: ['UAE', 'Emirates'],
  VN: ['Viet Nam'],
  LA: ['Laos'],
  BN: ['Brunei'],
  FM: ['Micronesia'],
  VA: ['Vatican', 'Holy See'],
}

const flagFor = (iso2) =>
  String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))

async function getJson(url, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'country-comparator-data-refresh' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (i === attempts) throw new Error(`${url}: ${err.message}`)
      await new Promise((r) => setTimeout(r, 1000 * i))
    }
  }
}

async function fetchIndicator(code) {
  // mrnev=1: most recent non-empty value per economy
  const data = await getJson(`${WB}/country/all/indicator/${code}?format=json&mrnev=1&per_page=400`)
  const rows = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : []
  const byIso3 = new Map()
  for (const r of rows) {
    if (r.countryiso3code && r.value !== null && r.value !== undefined) {
      byIso3.set(r.countryiso3code, { value: r.value, year: Number(r.date) })
    }
  }
  return byIso3
}

const catalog = await getJson(CATALOG_URL)
const selected = catalog
  .filter((c) => c.unMember || c.independent || EXTRA_CODES.has(c.cca2))
  .sort((a, b) => a.name.common.localeCompare(b.name.common, 'en'))

const indicatorData = {}
for (const [key, code] of Object.entries(INDICATORS)) {
  indicatorData[key] = await fetchIndicator(code)
  process.stdout.write(`${key.padEnd(22)} ${code.padEnd(22)} ${indicatorData[key].size} economies\n`)
}

const countries = selected.map((c) => {
  const iso3 = ISO3_TO_WB[c.cca3] ?? c.cca3
  const metrics = {
    capital: c.capital?.[0] ?? null,
    currency: Object.keys(c.currencies ?? {})[0] ?? null,
  }
  const years = {}
  for (const key of Object.keys(INDICATORS)) {
    const hit = indicatorData[key].get(iso3)
    metrics[key] = hit ? hit.value : null
    if (hit) years[key] = hit.year
  }
  const aliases = new Set([
    ...(c.altSpellings ?? []).filter((a) => a !== c.cca2),
    c.name.official,
    ...(EXTRA_ALIASES[c.cca2] ?? []),
  ])
  aliases.delete(c.name.common)
  return {
    code: c.cca2,
    code3: c.cca3,
    name: c.name.common,
    official: c.name.official,
    flag: c.flag || flagFor(c.cca2),
    region: c.region,
    subregion: c.subregion || null,
    aliases: [...aliases],
    metrics,
    years,
  }
})

const coverage = Object.fromEntries(
  Object.keys(INDICATORS).map((key) => [key, countries.filter((c) => c.metrics[key] !== null).length]),
)

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  sources: {
    worldbank: {
      name: 'World Bank Open Data',
      url: 'https://data.worldbank.org',
      license: 'CC BY 4.0',
      indicators: INDICATORS,
    },
    catalog: {
      name: 'mledoze/countries',
      url: 'https://github.com/mledoze/countries',
      license: 'ODbL 1.0',
    },
  },
  countries,
}

await writeFile(OUT, JSON.stringify(out) + '\n')
console.log(`\nwrote ${OUT}: ${countries.length} countries`)
console.log('coverage:', coverage)
