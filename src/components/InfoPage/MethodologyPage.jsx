import InfoPage from './InfoPage.jsx'
import { SOURCE_BY_ID } from './sources.js'
import { COUNTRIES, DATA_GENERATED_AT } from '../../data/countries.js'
import { METRICS, metricSource, metricValue, metricYear, commonYear } from '../../data/metrics.js'
import { pageHref } from '../../state/page.js'
import styles from './InfoPage.module.css'

// "2025", or "Mostly 2025 (2011–2025)" when countries report for different years
function yearsText(metric) {
  const years = COUNTRIES.filter((c) => metricValue(metric, c) !== null)
    .map((c) => metricYear(metric, c))
    .filter((y) => y !== null)
  if (!years.length) return 'Not dated'
  const min = Math.min(...years)
  const max = Math.max(...years)
  if (min === max) return String(max)
  return `Mostly ${commonYear(metric, COUNTRIES)} (${min}–${max})`
}

function coverageText(metric) {
  const count = COUNTRIES.filter((c) => metricValue(metric, c) !== null).length
  return `${count} of ${COUNTRIES.length}`
}

function MethodologyPage() {
  return (
    <InfoPage title="Methodology">
      <p>
        Each figure is the most recent value its source publishes for that country. The data was
        last rebuilt on {DATA_GENERATED_AT}. The <a href={pageHref('sources')}>Data sources</a> page
        lists every source and its license.
      </p>

      <h2>Which countries</h2>
      <p>
        {COUNTRIES.length} countries and territories: every UN member and every other independent
        state, plus Taiwan, Kosovo, Palestine, Hong Kong, Macao, Puerto Rico and Greenland, which
        people often look up.
      </p>

      <h2>Years</h2>
      <p>
        Countries report on different schedules, so one row can mix years. Next to each metric's name
        is the year most of the countries you're comparing reported for. A value reported for any
        other year shows its own year underneath. Metrics their sources don't date, such as
        capital, currency and coastline, show no year.
      </p>

      <h2>Units</h2>
      <p>
        Values are kept in the units their sources publish and converted for display: areas to
        square miles, lengths to miles, elevations to feet. Money is in current US dollars, not
        adjusted for inflation or purchasing power. Percentages are shares of the population, of
        GDP, or annual rates, as the metric's name says.
      </p>

      <h2>Missing values</h2>
      <p>
        A dash (—) means the source has no figure for that country. Nothing is estimated or filled
        in from other sources.
      </p>

      <h2>Factbook values are frozen</h2>
      <p>
        The CIA stopped publishing the World Factbook in February 2026. Metrics taken from it come
        from its final edition and won't change until they move to a source that is still updated.
        World Bank values refresh whenever the data is rebuilt.
      </p>

      <h2>Every metric</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Source</th>
              <th scope="col">Year</th>
              <th scope="col">Countries</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => {
              const source = metricSource(metric)
              return (
                <tr key={metric.key}>
                  <td>{metric.label}</td>
                  <td>
                    {SOURCE_BY_ID[source.id].short}
                    {source.indicator && (
                      <>
                        {' '}
                        <code>{source.indicator}</code>
                      </>
                    )}
                  </td>
                  <td>{yearsText(metric)}</td>
                  <td>{coverageText(metric)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.muted}>Countries is how many of the {COUNTRIES.length} have a value.</p>
    </InfoPage>
  )
}

export default MethodologyPage
