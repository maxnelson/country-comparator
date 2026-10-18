import { SAMPLE_COUNTRIES } from '../data/sampleCountries.js'
import { SAMPLE_METRICS, DEFAULT_VISIBLE_METRIC_COUNT } from '../data/sampleMetrics.js'

// The comparison lives in the query string so any view is a shareable link:
//   ?countries=us-jp-de&metrics=population-gdp_usd
// Order is display order. Both parameters are always written, so the bare
// URL is only ever seen for an instant before it is replaced by the default
// comparison. Hyphens separate ids (metric keys contain underscores, and a
// plus sign would decode as a space).

export const DEFAULT_CODES = ['US', 'JP', 'DE']
export const DEFAULT_METRIC_KEYS = SAMPLE_METRICS.slice(0, DEFAULT_VISIBLE_METRIC_COUNT).map(
  (m) => m.key,
)

const COUNTRY_PARAM = 'countries'
const METRIC_PARAM = 'metrics'
// Earlier links used single-letter names and commas; still accepted when reading.
const LEGACY_COUNTRY_PARAM = 'c'
const LEGACY_METRIC_PARAM = 'm'
const SEPARATOR = '-'
const SPLIT = /[-,]/

const VALID_CODES = new Set(SAMPLE_COUNTRIES.map((c) => c.code))
const VALID_METRIC_KEYS = new Set(SAMPLE_METRICS.map((m) => m.key))

// Keeps known ids in the order given, without duplicates; null when none survive.
function parseList(value, valid, normalize) {
  if (!value) return null
  const seen = new Set()
  const out = []
  for (const raw of value.split(SPLIT)) {
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
  const codes = parseList(
    params.get(COUNTRY_PARAM) ?? params.get(LEGACY_COUNTRY_PARAM),
    VALID_CODES,
    (s) => s.toUpperCase(),
  )
  const metricKeys = parseList(
    params.get(METRIC_PARAM) ?? params.get(LEGACY_METRIC_PARAM),
    VALID_METRIC_KEYS,
    (s) => s.toLowerCase(),
  )
  return { codes: codes ?? DEFAULT_CODES, metricKeys: metricKeys ?? DEFAULT_METRIC_KEYS }
}

export function buildSearch({ codes, metricKeys }) {
  // Built by hand so the separators stay readable (URLSearchParams would
  // escape them). Codes and keys only ever contain [A-Za-z0-9_].
  const countries = codes.map((c) => c.toLowerCase()).join(SEPARATOR)
  const metrics = metricKeys.join(SEPARATOR)
  return `?${COUNTRY_PARAM}=${countries}&${METRIC_PARAM}=${metrics}`
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
