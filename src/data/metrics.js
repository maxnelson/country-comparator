// Metric definitions: what the table can show, in default display order.
//   key      stable id used in the URL and in activeMetricKeys
//   source   key in a country's `metrics`/`years` when it differs from `key`
//            (data is stored in source units: km², USD)
//   convert  display-unit conversion applied to the stored value
//   format   display string; returns "—" for a missing value
// Numeric metrics come from the World Bank; capital and currency from the
// catalog. See scripts/fetch-data.mjs.

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 })
const withCommas = (v) => Math.round(v).toLocaleString('en-US')
const oneDecimal = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 1 })
const percent = (v) => oneDecimal(v) + '%'
const fmt = (formatter) => (v) => (v === null || v === undefined ? '—' : formatter(v))

const KM2_TO_SQ_MI = 0.386102
const PER_KM2_TO_PER_SQ_MI = 2.58999

export const METRICS = [
  { key: 'population',       label: 'Population',               format: fmt(withCommas) },
  { key: 'area_sq_mi',       label: 'Area (sq mi)',             source: 'area_km2', convert: (v) => v * KM2_TO_SQ_MI, format: fmt(withCommas) },
  { key: 'gdp_usd',          label: 'GDP',                      format: fmt((v) => '$' + compact.format(v)) },
  { key: 'gdp_per_capita',   label: 'GDP per capita',           format: fmt((v) => '$' + withCommas(v)) },
  { key: 'life_expectancy',  label: 'Life expectancy (years)',  format: fmt(oneDecimal) },
  { key: 'capital',          label: 'Capital',                  format: fmt((v) => v) },
  { key: 'currency',         label: 'Currency',                 format: fmt((v) => v) },
  { key: 'pop_density',      label: 'Pop. density (per sq mi)', source: 'pop_density_km2', convert: (v) => v * PER_KM2_TO_PER_SQ_MI, format: fmt(oneDecimal) },
  { key: 'internet_pct',     label: 'Internet users',           format: fmt(percent) },
  { key: 'unemployment_pct', label: 'Unemployment',             format: fmt(percent) },
  // Below the fold by default; added via "Add metric"
  { key: 'literacy_pct',        label: 'Literacy rate',          format: fmt(percent) },
  { key: 'co2_per_capita',      label: 'CO₂ (tons / capita)',    format: fmt(oneDecimal) },
  { key: 'military_spending_b', label: 'Military spending',      source: 'military_spending_usd', convert: (v) => v / 1e9, format: fmt((v) => '$' + oneDecimal(v) + 'B') },
]

export const DEFAULT_VISIBLE_METRIC_COUNT = 10

// Display value for a metric, or null when the country has no data for it
export function metricValue(metric, country) {
  const raw = country.metrics[metric.source ?? metric.key]
  if (raw === null || raw === undefined) return null
  return metric.convert ? metric.convert(raw) : raw
}

// Year the value was reported for, when the source records one
export function metricYear(metric, country) {
  return country.years?.[metric.source ?? metric.key] ?? null
}
