import { useState } from 'react'
import { SAMPLE_COUNTRIES } from '../../data/sampleCountries.js'
import { SAMPLE_METRICS, DEFAULT_VISIBLE_METRIC_COUNT } from '../../data/sampleMetrics.js'
import styles from './ComparisonTable.module.css'

const INITIAL_COUNTRY_CODES = ['US', 'JP', 'DE']

// Type size steps down as columns are added so values keep fitting.
function densityFor(columnCount) {
  if (columnCount <= 3) return 'comfortable'
  if (columnCount <= 5) return 'compact'
  return 'dense'
}

function ComparisonTable() {
  const [activeCodes, setActiveCodes] = useState(INITIAL_COUNTRY_CODES)
  const [visibleMetricCount, setVisibleMetricCount] = useState(DEFAULT_VISIBLE_METRIC_COUNT)

  const activeCountries = activeCodes
    .map((code) => SAMPLE_COUNTRIES.find((c) => c.code === code))
    .filter(Boolean)

  const remainingCountries = SAMPLE_COUNTRIES.filter(
    (c) => !activeCodes.includes(c.code),
  )

  const visibleMetrics = SAMPLE_METRICS.slice(0, visibleMetricCount)
  const canAddCountry = remainingCountries.length > 0
  const canAddMetric = visibleMetricCount < SAMPLE_METRICS.length

  const handleAddCountry = () => {
    if (!canAddCountry) return
    setActiveCodes((prev) => [...prev, remainingCountries[0].code])
  }

  const handleAddMetric = () => {
    setVisibleMetricCount((n) => Math.min(n + 1, SAMPLE_METRICS.length))
  }

  return (
    <>
      <section
        className={styles.table}
        data-density={densityFor(activeCountries.length)}
        style={{ '--col-count': activeCountries.length }}
        role="table"
        aria-label="Country comparison"
      >
        {/* Sticky header row: flags + names */}
        <div className={`${styles.row} ${styles.headerRow}`} role="row">
          <div className={styles.corner} role="columnheader" aria-label="Metric" />
          {activeCountries.map((country) => (
            <div key={country.code} className={styles.headerCell} role="columnheader">
              <span
                className={styles.flag}
                role="img"
                aria-label={`${country.name} flag`}
              >
                {country.flag}
              </span>
              <span className={styles.countryName}>{country.name}</span>
            </div>
          ))}
        </div>

        {/* One row per metric: label, then one value per country */}
        {visibleMetrics.map((metric) => (
          <div key={metric.key} className={styles.row} role="row">
            <div className={styles.metricLabel} role="rowheader">
              {metric.label}
            </div>
            {activeCountries.map((country) => {
              const raw = country.metrics[metric.key]
              const full = metric.format(raw)
              const short = metric.formatCompact ? metric.formatCompact(raw) : full
              return (
                <div key={country.code} className={styles.value} role="cell">
                  <span className={styles.full}>{full}</span>
                  {short !== full && <span className={styles.short}>{short}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </section>

      {/* Bottom action bar on phones; toolbar above the table on wide screens */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.action}
          onClick={handleAddCountry}
          disabled={!canAddCountry}
        >
          <span aria-hidden="true">+</span> Add country
        </button>
        <button
          type="button"
          className={styles.action}
          onClick={handleAddMetric}
          disabled={!canAddMetric}
        >
          <span aria-hidden="true">+</span> Add metric
        </button>
      </div>
    </>
  )
}

export default ComparisonTable
