import { SAMPLE_COUNTRIES } from '../data/sampleCountries.js'
import { SAMPLE_METRICS, DEFAULT_VISIBLE_METRIC_COUNT } from '../data/sampleMetrics.js'

// The comparison lives in the query string so any view is a shareable link:
//   ?c=US,JP,DE&m=population,gdp_usd
// Order is display order. A parameter is omitted when it equals the default,
// so the default view has a clean URL.

export const DEFAULT_CODES = ['US', 'JP', 'DE']
export const DEFAULT_METRIC_KEYS = SAMPLE_METRICS.slice(0, DEFAULT_VISIBLE_METRIC_COUNT).map(
  (m) => m.key,
)

const COUNTRY_PARAM = 'c'
const METRIC_PARAM = 'm'

const VALID_CODES = new Set(SAMPLE_COUNTRIES.map((c) => c.code))
const VALID_METRIC_KEYS = new Set(SAMPLE_METRICS.map((m) => m.key))

// Keeps known ids in the order given, without duplicates; null when none survive.
function parseList(value, valid, normalize) {
  if (!value) return null
  const seen = new Set()
  const out = []
  for (const raw of value.split(',')) {
    const id = normalize(raw.trim())
    if (valid.has(id) && !seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out.length ? out : null
}

export function parseSearch(search) {
  const params = new URLSearchParams(search)
  const codes = parseList(params.get(COUNTRY_PARAM), VALID_CODES, (s) => s.toUpperCase())
  const metricKeys = parseList(params.get(METRIC_PARAM), VALID_METRIC_KEYS, (s) =>
    s.toLowerCase(),
  )
  return { codes: codes ?? DEFAULT_CODES, metricKeys: metricKeys ?? DEFAULT_METRIC_KEYS }
}

const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

export function buildSearch({ codes, metricKeys }) {
  // Built by hand so commas stay readable (URLSearchParams would write %2C).
  // Codes and keys only ever contain [A-Za-z0-9_], so nothing needs escaping.
  const parts = []
  if (!sameList(codes, DEFAULT_CODES)) parts.push(`${COUNTRY_PARAM}=${codes.join(',')}`)
  if (!sameList(metricKeys, DEFAULT_METRIC_KEYS)) parts.push(`${METRIC_PARAM}=${metricKeys.join(',')}`)
  return parts.length ? `?${parts.join('&')}` : ''
}

const nameOf = (code) => SAMPLE_COUNTRIES.find((c) => c.code === code)?.name ?? code

export function titleFor(codes) {
  const names = codes.map(nameOf)
  const list =
    names.length <= 3
      ? names.join(' vs ')
      : `${names.slice(0, 2).join(' vs ')} and ${names.length - 2} more`
  return `${list} · Country Comparator`
}
