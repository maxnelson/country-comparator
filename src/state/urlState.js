import { COUNTRIES } from '../data/countries.js'
import { METRICS, DEFAULT_VISIBLE_METRIC_COUNT } from '../data/metrics.js'

// The comparison lives in the query string so any view is a shareable link:
//   ?countries=us-jp-de&metrics=population-gdp_usd
// Order is display order. Both parameters are always written, so the bare
// URL is only ever seen for an instant before it is replaced by the default
// comparison. Hyphens separate ids (metric keys contain underscores, and a
// plus sign would decode as a space).

// A fresh visit compares the United States with one other country, picked at
// random on each load so the app shows something different every time.
export const DEFAULT_FIRST_CODE = 'US'
const DEFAULT_OTHERS = COUNTRIES.filter((c) => c.code !== DEFAULT_FIRST_CODE).map((c) => c.code)

export function defaultCodes(random = Math.random) {
  const index = Math.min(Math.floor(random() * DEFAULT_OTHERS.length), DEFAULT_OTHERS.length - 1)
  return [DEFAULT_FIRST_CODE, DEFAULT_OTHERS[index]]
}
export const DEFAULT_METRIC_KEYS = METRICS.slice(0, DEFAULT_VISIBLE_METRIC_COUNT).map(
  (m) => m.key,
)

const COUNTRY_PARAM = 'countries'
const METRIC_PARAM = 'metrics'
// Earlier links used single-letter names and commas; still accepted when reading.
const LEGACY_COUNTRY_PARAM = 'c'
const LEGACY_METRIC_PARAM = 'm'
const SEPARATOR = '-'
const SPLIT = /[-,]/

const VALID_CODES = new Set(COUNTRIES.map((c) => c.code))
const VALID_METRIC_KEYS = new Set(METRICS.map((m) => m.key))

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

// `random` picks the second default country when the URL names none
export function parseSearch(search, random = Math.random) {
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
  return { codes: codes ?? defaultCodes(random), metricKeys: metricKeys ?? DEFAULT_METRIC_KEYS }
}

export function buildSearch({ codes, metricKeys }) {
  // Built by hand so the separators stay readable (URLSearchParams would
  // escape them). Codes and keys only ever contain [A-Za-z0-9_].
  const countries = codes.map((c) => c.toLowerCase()).join(SEPARATOR)
  const metrics = metricKeys.join(SEPARATOR)
  return `?${COUNTRY_PARAM}=${countries}&${METRIC_PARAM}=${metrics}`
}

const nameOf = (code) => COUNTRIES.find((c) => c.code === code)?.name ?? code

export function titleFor(codes) {
  const names = codes.map(nameOf)
  const list =
    names.length <= 3
      ? names.join(' vs ')
      : `${names.slice(0, 2).join(' vs ')} and ${names.length - 2} more`
  return `${list} · Country Comparator`
}
