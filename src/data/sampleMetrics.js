// Sample metric definitions — placeholder set for UI development.
// `format` returns a display string from a raw value; returns "—" if value is nullish.
// `formatCompact` (optional) is a shorter rendering the table swaps in when
// columns get narrow, e.g. "333.3M" instead of "333,287,557".

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
})

const withCommas = (v) => v.toLocaleString('en-US')
// One decimal keeps compact strings to six characters or fewer ("333.3M", "1.4B")
const compactShort = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const compactNumber = (v) => compactShort.format(v)
const oneDecimal = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 1 })

const fmt = (formatter) => (v) =>
  v === null || v === undefined ? '—' : formatter(v)

export const SAMPLE_METRICS = [
  { key: 'population',          label: 'Population',                  format: fmt(withCommas), formatCompact: fmt(compactNumber) },
  { key: 'area_sq_mi',          label: 'Area (sq mi)',                format: fmt(withCommas), formatCompact: fmt(compactNumber) },
  { key: 'gdp_usd',             label: 'GDP',                         format: fmt((v) => '$' + compact.format(v)) },
  { key: 'gdp_per_capita',      label: 'GDP per capita',              format: fmt((v) => '$' + withCommas(v)), formatCompact: fmt((v) => '$' + compactNumber(v)) },
  { key: 'life_expectancy',     label: 'Life expectancy (years)',     format: fmt(oneDecimal) },
  { key: 'median_age',          label: 'Median age',                  format: fmt(oneDecimal) },
  { key: 'capital',             label: 'Capital',                     format: fmt((v) => v) },
  { key: 'currency',            label: 'Currency',                    format: fmt((v) => v) },
  { key: 'pop_density',         label: 'Pop. density (per sq mi)',    format: fmt(oneDecimal) },
  { key: 'internet_pct',        label: 'Internet users',              format: fmt((v) => v + '%') },
  { key: 'unemployment_pct',    label: 'Unemployment',                format: fmt((v) => v + '%') },
  { key: 'literacy_pct',        label: 'Literacy rate',               format: fmt((v) => v + '%') },
  // Below-the-fold defaults — revealed via "Add metric" button
  { key: 'co2_per_capita',      label: 'CO₂ (tons / capita)',         format: fmt(oneDecimal) },
  { key: 'military_spending_b', label: 'Military spending',           format: fmt((v) => '$' + v + 'B') },
  { key: 'avg_temp_f',          label: 'Avg. temperature (°F)',       format: fmt(oneDecimal) },
  { key: 'coastline_mi',        label: 'Coastline (mi)',              format: fmt(withCommas), formatCompact: fmt(compactNumber) },
  { key: 'unesco_sites',        label: 'UNESCO World Heritage sites', format: fmt(withCommas) },
  { key: 'tourism_millions',    label: 'Tourist arrivals (millions)', format: fmt(oneDecimal) },
  { key: 'top_income_tax_pct',  label: 'Top income tax rate',         format: fmt((v) => v + '%') },
  { key: 'public_debt_pct',     label: 'Public debt (% of GDP)',      format: fmt((v) => v + '%') },
]

export const DEFAULT_VISIBLE_METRIC_COUNT = 12
