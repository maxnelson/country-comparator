import { Fragment, useState } from 'react'
import { SAMPLE_COUNTRIES } from '../../data/sampleCountries.js'
import { SAMPLE_METRICS, DEFAULT_VISIBLE_METRIC_COUNT } from '../../data/sampleMetrics.js'
import styles from './ComparisonTable.module.css'

const INITIAL_COUNTRY_CODES = ['US', 'JP', 'DE']

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
  const hasMoreMetrics = visibleMetricCount < SAMPLE_METRICS.length
  const canAddCountry = remainingCountries.length > 0

  const handleAddCountry = () => {
    if (!canAddCountry) return
    setActiveCodes((prev) => [...prev, remainingCountries[0].code])
  }

  const handleAddMetric = () => {
    setVisibleMetricCount((n) =>
      Math.min(n + 1, SAMPLE_METRICS.length),
    )
  }

  const columnCount = activeCountries.length + (canAddCountry ? 1 : 0)

  return (
    <section className={styles.wrapper}>
      <div
        className={styles.table}
        style={{ '--col-count': columnCount }}
        role="table"
        aria-label="Country comparison"
      >
        {/* Header row */}
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
        {canAddCountry && (
          <button
            type="button"
            className={styles.addCountry}
            onClick={handleAddCountry}
            aria-label="Add country"
          >
            <span className={styles.addCountryIcon} aria-hidden="true">+</span>
            <span className={styles.addCountryLabel}>Add country</span>
          </button>
        )}

        {/* Metric rows */}
        {visibleMetrics.map((metric) => (
          <Fragment key={metric.key}>
            {activeCountries.map((country) => (
              <div key={country.code} className={styles.cell} role="cell">
                <div className={styles.metricLabel}>{metric.label}</div>
                <div className={styles.metricValue}>
                  {metric.format(country.metrics[metric.key])}
                </div>
              </div>
            ))}
            {canAddCountry && <div className={styles.placeholder} aria-hidden="true" />}
          </Fragment>
        ))}
      </div>

      {hasMoreMetrics && (
        <div className={styles.addMetricRow}>
          <button
            type="button"
            className={styles.addMetricButton}
            onClick={handleAddMetric}
          >
            + Add metric
          </button>
        </div>
      )}
    </section>
  )
}

export default ComparisonTable
