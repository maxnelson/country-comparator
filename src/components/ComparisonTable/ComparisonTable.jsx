import { useRef, useState } from 'react'
import { SAMPLE_COUNTRIES } from '../../data/sampleCountries.js'
import { SAMPLE_METRICS, DEFAULT_VISIBLE_METRIC_COUNT } from '../../data/sampleMetrics.js'
import Picker from '../Picker/Picker.jsx'
import styles from './ComparisonTable.module.css'

const INITIAL_COUNTRY_CODES = ['US', 'JP', 'DE']

function PlusIcon() {
  return (
    <svg className={styles.plusIcon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function ComparisonTable() {
  const [activeCodes, setActiveCodes] = useState(INITIAL_COUNTRY_CODES)
  const [visibleMetricCount, setVisibleMetricCount] = useState(DEFAULT_VISIBLE_METRIC_COUNT)
  const countryPickerRef = useRef(null)
  const addCountryButtonRef = useRef(null)

  const activeCountries = activeCodes
    .map((code) => SAMPLE_COUNTRIES.find((c) => c.code === code))
    .filter(Boolean)

  const remainingCountries = SAMPLE_COUNTRIES.filter(
    (c) => !activeCodes.includes(c.code),
  )

  const visibleMetrics = SAMPLE_METRICS.slice(0, visibleMetricCount)
  const canAddCountry = remainingCountries.length > 0
  const canAddMetric = visibleMetricCount < SAMPLE_METRICS.length

  const countryPickerItems = remainingCountries.map((c) => ({
    id: c.code,
    label: c.name,
    leading: c.flag,
    hint: c.code,
    keywords: [c.code, ...(c.aliases ?? [])],
  }))

  const openCountryPicker = () => {
    countryPickerRef.current?.open(addCountryButtonRef.current)
  }

  const handleSelectCountry = (item) => {
    setActiveCodes((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
  }

  // Until the metric picker ships (next roadmap step), "add" appends the next metric.
  const handleAddMetric = () => {
    setVisibleMetricCount((n) => Math.min(n + 1, SAMPLE_METRICS.length))
  }

  return (
    <section
      className={styles.table}
      style={{ '--col-count': activeCountries.length }}
      role="table"
      aria-label="Country comparison"
    >
      {/* Header row: pinned to the top. Flags + names, then the add-country cell pinned right. */}
      <div className={`${styles.row} ${styles.headerRow}`} role="row">
        <div className={styles.corner} role="columnheader" aria-label="Metric" />
        {activeCountries.map((country, i) => (
          <div
            key={country.code}
            className={styles.headerCell}
            style={{ '--i': i + 1 }}
            role="columnheader"
          >
            <span className={styles.flag} role="img" aria-label={`${country.name} flag`}>
              {country.flag}
            </span>
            <span className={styles.countryName}>{country.name}</span>
          </div>
        ))}
        <div className={styles.addColumnCell} role="columnheader">
          <button
            ref={addCountryButtonRef}
            type="button"
            className={styles.addColumnButton}
            onClick={openCountryPicker}
            disabled={!canAddCountry}
            aria-label="Add country"
            title="Add country"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* One row per metric: label (pinned left), then one value per country */}
      {visibleMetrics.map((metric) => (
        <div key={metric.key} className={styles.row} role="row">
          <div className={styles.label} role="rowheader">
            <span className={styles.labelText}>{metric.label}</span>
          </div>
          {activeCountries.map((country, i) => (
            <div
              key={country.code}
              className={styles.value}
              style={{ '--i': i + 1 }}
              role="cell"
            >
              {metric.format(country.metrics[metric.key])}
            </div>
          ))}
        </div>
      ))}

      {/* Add-metric row: always the last row, pinned to the bottom */}
      {canAddMetric && (
        <div className={`${styles.row} ${styles.addRow}`} role="row">
          <div className={styles.addRowCell} role="cell">
            <button type="button" className={styles.addRowButton} onClick={handleAddMetric}>
              <PlusIcon /> Add metric
            </button>
          </div>
        </div>
      )}

      <Picker
        ref={countryPickerRef}
        title="Add a country"
        placeholder="Search countries"
        emptyMessage="No countries match"
        items={countryPickerItems}
        onSelect={handleSelectCountry}
      />
    </section>
  )
}

export default ComparisonTable
