// Parsers for CIA World Factbook country profiles as published by
// factbook/factbook.json. Fields are prose such as "46.9 years (2025 est.)";
// these turn them into numbers and the year they were estimated for.

// First number in the text (handles commas, decimals, negatives) and the
// first four-digit year in parentheses, e.g. "(2025 est.)" or "(2023)".
export function parseMeasure(text) {
  if (typeof text !== 'string') return null
  const num = text.match(/-?\d[\d,]*(?:\.\d+)?/)
  if (!num) return null
  const value = Number(num[0].replace(/,/g, ''))
  if (!Number.isFinite(value)) return null
  const year = text.match(/\((?:[^)]*?)?((?:19|20)\d{2})(?:\s*est\.)?\)/)
  return { value, year: year ? Number(year[1]) : null }
}

// Economy fields come as { "Inflation rate (consumer prices) 2024": "2.3% (2024 est.)", ... };
// returns the text for the most recent year, ignoring notes.
export function latestYearText(node) {
  if (!node || typeof node !== 'object') return null
  let best = null
  for (const [key, val] of Object.entries(node)) {
    const m = key.match(/((?:19|20)\d{2})$/)
    if (!m) continue
    const year = Number(m[1])
    const text = typeof val === 'string' ? val : val?.text
    if (typeof text === 'string' && (!best || year > best.year)) best = { year, text }
  }
  return best ? best.text : null
}

const textOf = (node) => (typeof node === 'string' ? node : node?.text ?? null)

// Walks a profile with a path of keys; returns the node or undefined.
function dig(profile, path) {
  return path.reduce((n, k) => (n && typeof n === 'object' ? n[k] : undefined), profile)
}

// Metric data key -> how to read it. `path` leads to a node whose `text`
// holds the measure; `latest` marks multi-year Economy-style nodes.
export const FACTBOOK_FIELDS = {
  median_age:        { path: ['People and Society', 'Median age', 'total'] },
  coastline_km:      { path: ['Geography', 'Coastline'] },
  urban_pct:         { path: ['People and Society', 'Urbanization', 'urban population'] },
  fertility_rate:    { path: ['People and Society', 'Total fertility rate'] },
  infant_mortality:  { path: ['People and Society', 'Infant mortality rate', 'total'] },
  physician_density: { path: ['People and Society', 'Physician density'] },
  highest_point_m:   { path: ['Geography', 'Elevation', 'highest point'] },
  airports:          { path: ['Transportation', 'Airports'] },
  gini:              { path: ['Economy', 'Gini Index coefficient - distribution of family income'], latest: true },
  inflation_pct:     { path: ['Economy', 'Inflation rate (consumer prices)'], latest: true },
  gdp_growth_pct:    { path: ['Economy', 'Real GDP growth rate'], latest: true },
  military_gdp_pct:  { path: ['Military and Security', 'Military expenditures'], latest: true },
  electricity_pct:   { path: ['Energy', 'Electricity access', 'electrification - total population'] },
}

export const FACTBOOK_TEXT_FIELDS = {
  government_type: { path: ['Government', 'Government type'] },
}

// Returns { metrics: { key: number|string|null }, years: { key: year } } for one profile
export function extractFactbook(profile) {
  const metrics = {}
  const years = {}
  for (const [key, spec] of Object.entries(FACTBOOK_FIELDS)) {
    const node = dig(profile, spec.path)
    const text = spec.latest ? latestYearText(node) : textOf(node)
    const parsed = parseMeasure(text)
    metrics[key] = parsed ? parsed.value : null
    if (parsed?.year) years[key] = parsed.year
  }
  for (const [key, spec] of Object.entries(FACTBOOK_TEXT_FIELDS)) {
    const text = textOf(dig(profile, spec.path))
    // Keep the short form: drop parenthetical and semicolon-separated elaborations
    metrics[key] = text ? text.split(/[;(]/)[0].trim().replace(/<[^>]+>/g, '') || null : null
  }
  return { metrics, years }
}

// Factbook region names (codes.csv) -> folder names in factbook.json
export function regionFolder(region) {
  return region
    .toLowerCase()
    .replace(/\s*&\s*|\s+and\s+/g, ' n ')
    .trim()
    .replace(/[\s_]+/g, '-')
}
