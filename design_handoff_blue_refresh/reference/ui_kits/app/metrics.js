// Port of src/data/metrics.js + src/state/urlState.js defaults.
(function () {
  const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
  const withCommas = (v) => Math.round(v).toLocaleString('en-US');
  const oneDecimal = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const twoDecimals = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const percent = (v) => oneDecimal(v) + '%';
  const fmt = (f) => (v) => (v === null || v === undefined ? '—' : f(v));
  const M = [
    ['population', 'Population', null, null, withCommas],
    ['area_sq_mi', 'Area (sq mi)', 'area_km2', (v) => v * 0.386102, withCommas],
    ['gdp_usd', 'GDP', null, null, (v) => '$' + compact.format(v)],
    ['gdp_per_capita', 'GDP per capita', null, null, (v) => '$' + withCommas(v)],
    ['life_expectancy', 'Life expectancy (years)', null, null, oneDecimal],
    ['capital', 'Capital', null, null, (v) => v],
    ['currency', 'Currency', null, null, (v) => v],
    ['pop_density', 'Pop. density (per sq mi)', 'pop_density_km2', (v) => v * 2.58999, oneDecimal],
    ['internet_pct', 'Internet users', null, null, percent],
    ['unemployment_pct', 'Unemployment', null, null, percent],
    ['median_age', 'Median age', null, null, oneDecimal],
    ['literacy_pct', 'Literacy rate', null, null, percent],
    ['co2_per_capita', 'CO₂ (tons / capita)', null, null, oneDecimal],
    ['military_spending_b', 'Military spending', 'military_spending_usd', (v) => v / 1e9, (v) => '$' + oneDecimal(v) + 'B'],
    ['military_gdp_pct', 'Military spending (% of GDP)', null, null, percent],
    ['gdp_growth_pct', 'GDP growth', null, null, percent],
    ['inflation_pct', 'Inflation', null, null, percent],
    ['gini', 'Gini index (inequality)', null, null, oneDecimal],
    ['urban_pct', 'Urban population', null, null, percent],
    ['fertility_rate', 'Fertility rate (births per woman)', null, null, twoDecimals],
    ['infant_mortality', 'Infant mortality (per 1,000 births)', null, null, oneDecimal],
    ['physician_density', 'Physicians (per 1,000 people)', null, null, twoDecimals],
    ['electricity_pct', 'Electricity access', null, null, percent],
    ['coastline_mi', 'Coastline (mi)', 'coastline_km', (v) => v * 0.621371, withCommas],
    ['highest_point_ft', 'Highest point (ft)', 'highest_point_m', (v) => v * 3.28084, withCommas],
    ['airports', 'Airports', null, null, withCommas],
    ['government_type', 'Government type', null, null, (v) => v],
  ].map(([key, label, source, convert, f]) => ({ key, label, source, convert, format: fmt(f) }));
  const metricValue = (m, c) => {
    const raw = c.metrics[m.source || m.key];
    if (raw === null || raw === undefined) return null;
    return m.convert ? m.convert(raw) : raw;
  };
  window.CC_METRICS = M;
  window.CC_FORMAT = (m, c) => m.format(metricValue(m, c));
  window.CC_DEFAULT_CODES = ['US', 'JP', 'DE'];
  window.CC_DEFAULT_METRIC_KEYS = M.slice(0, 10).map((m) => m.key);
})();
