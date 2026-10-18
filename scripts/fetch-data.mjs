#!/usr/bin/env node
// Builds src/data/countries.json from public sources. Run with `npm run data:refresh`.
//
// Sources
//   World Bank Indicators API (CC BY 4.0): the numeric metrics, most recent
//     non-empty value per economy, with the year it was reported for.
//   mledoze/countries (ODbL 1.0): the catalog — names, ISO codes, capitals,
//     currencies, regions and alternative spellings used for search.
//   CIA World Factbook (public domain), via the factbook/factbook.json
//     archive: median age, coastline and other fields the World Bank lacks.
//     The CIA stopped publishing the Factbook in February 2026, so these
//     values are the final edition and will not refresh.
//   datasets/country-codes (public domain): maps ISO codes to the
//     Factbook's own GEC/FIPS codes.
//
// Values are stored in source units (km², USD, m); display conversions live in
// src/data/metrics.js so the data stays honest and units can be toggled later.

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { extractFactbook, regionFolder } from './lib/factbook.mjs'

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/countries.json')
const WB = 'https://api.worldbank.org/v2'
const CATALOG_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
const FACTBOOK_BASE = 'https://raw.githubusercontent.com/factbook/factbook.json/master'
const FACTBOOK_CODES_URL = 'https://raw.githubusercontent.com/factbook/factbook/master/factbook-codes/data/codes.csv'
const ISO_CODES_URL = 'https://raw.githubusercontent.com/datasets/country-codes/main/data/country-codes.csv'
// ISO2 -> Factbook code where the codes dataset has no row (Kosovo) or a
// different split (Palestine is West Bank + Gaza Strip in the Factbook)
const FACTBOOK_CODE_OVERRIDES = { XK: 'kv', PS: null }
const FACTBOOK_FOLDERS = [
  'africa', 'antarctica', 'australia-oceania', 'central-america-n-caribbean', 'central-asia',
  'east-n-southeast-asia', 'europe', 'middle-east', 'north-america', 'oceans', 'south-america',
  'south-asia', 'world',
]

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

async function getText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'country-comparator-data-refresh' } })
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res.text()
}

// Minimal CSV reader for the two code tables (quoted fields, no embedded newlines)
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  const split = (line) => {
    const out = []
    let cur = ''
    let q = false
    for (const ch of line) {
      if (ch === '"') q = !q
      else if (ch === ',' && !q) { out.push(cur); cur = '' }
      else cur += ch
    }
    out.push(cur)
    return out
  }
  const header = split(lines[0])
  return lines.slice(1).map((l) => Object.fromEntries(split(l).map((v, i) => [header[i], v])))
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        results[i] = await fn(items[i], i)
      }
    }),
  )
  return results
}

// Fetches one Factbook profile, trying the expected folder first
async function fetchFactbookProfile(code, folder) {
  const folders = [folder, ...FACTBOOK_FOLDERS.filter((f) => f !== folder)]
  for (const f of folders) {
    const res = await fetch(`${FACTBOOK_BASE}/${f}/${code}.json`, {
      headers: { 'User-Agent': 'country-comparator-data-refresh' },
    })
    if (res.ok) return res.json()
    if (res.status !== 404) throw new Error(`factbook ${code}: HTTP ${res.status}`)
  }
  return null
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

// ---- Factbook: ISO2 -> GEC code -> region folder -> profile ----
const isoRows = parseCsv(await getText(ISO_CODES_URL))
const gecByIso2 = new Map(isoRows.filter((r) => r['ISO3166-1-Alpha-2'] && r.FIPS).map((r) => [r['ISO3166-1-Alpha-2'], r.FIPS.toLowerCase()]))
const factbookCodes = parseCsv(await getText(FACTBOOK_CODES_URL))
const folderByGec = new Map(factbookCodes.map((r) => [r.Code.toLowerCase(), regionFolder(r.Region)]))

const factbookByIso2 = new Map()
const unmapped = []
await mapLimit(selected, 8, async (c) => {
  const gec = c.cca2 in FACTBOOK_CODE_OVERRIDES ? FACTBOOK_CODE_OVERRIDES[c.cca2] : gecByIso2.get(c.cca2)
  if (!gec) { unmapped.push(c.cca2); return }
  const profile = await fetchFactbookProfile(gec, folderByGec.get(gec) ?? 'europe')
  if (!profile) { unmapped.push(`${c.cca2}(${gec})`); return }
  factbookByIso2.set(c.cca2, extractFactbook(profile))
})
process.stdout.write(`factbook profiles: ${factbookByIso2.size} of ${selected.length}` + (unmapped.length ? ` (none for ${unmapped.join(', ')})` : '') + '\n')

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
  const fb = factbookByIso2.get(c.cca2)
  if (fb) {
    Object.assign(metrics, fb.metrics)
    Object.assign(years, fb.years)
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

const metricKeys = Object.keys(countries.find((c) => factbookByIso2.has(c.code))?.metrics ?? countries[0].metrics)
const coverage = Object.fromEntries(
  metricKeys.map((key) => [key, countries.filter((c) => c.metrics[key] !== null && c.metrics[key] !== undefined).length]),
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
    factbook: {
      name: 'CIA World Factbook (final edition, via factbook/factbook.json)',
      url: 'https://github.com/factbook/factbook.json',
      license: 'Public domain',
      note: 'The CIA stopped publishing the Factbook in February 2026; these values are from its final edition and will not refresh.',
    },
    codes: {
      name: 'datasets/country-codes',
      url: 'https://github.com/datasets/country-codes',
      license: 'Public domain (ODC-PDDL)',
    },
  },
  countries,
}

await writeFile(OUT, JSON.stringify(out) + '\n')
console.log(`\nwrote ${OUT}: ${countries.length} countries`)
console.log('coverage:', coverage)
