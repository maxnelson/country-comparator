import { useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { SAMPLE_COUNTRIES } from '../../data/sampleCountries.js'
import { SAMPLE_METRICS, DEFAULT_VISIBLE_METRIC_COUNT } from '../../data/sampleMetrics.js'
import Picker from '../Picker/Picker.jsx'
import { moveItem } from './reorder.js'
import styles from './ComparisonTable.module.css'

const INITIAL_COUNTRY_CODES = ['US', 'JP', 'DE']
const INITIAL_METRIC_KEYS = SAMPLE_METRICS.slice(0, DEFAULT_VISIBLE_METRIC_COUNT).map((m) => m.key)
const MIN_COUNTRIES = 1
const MIN_METRICS = 1

const metricLabel = (key) => SAMPLE_METRICS.find((m) => m.key === key)?.label ?? key

// Screen-reader announcements for drag and drop, using labels instead of keys
const dragAnnouncements = {
  onDragStart: ({ active }) => `Picked up ${metricLabel(active.id)}.`,
  onDragOver: ({ active, over }) =>
    over
      ? `${metricLabel(active.id)} is over ${metricLabel(over.id)}.`
      : `${metricLabel(active.id)} is no longer over a row.`,
  onDragEnd: ({ active, over }) =>
    over
      ? `${metricLabel(active.id)} was moved to the position of ${metricLabel(over.id)}.`
      : `${metricLabel(active.id)} was dropped.`,
  onDragCancel: ({ active }) => `Reordering ${metricLabel(active.id)} was cancelled.`,
}

function PlusIcon() {
  return (
    <svg className={styles.plusIcon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="currentColor">
      <circle cx="5.5" cy="3" r="1.5" />
      <circle cx="10.5" cy="3" r="1.5" />
      <circle cx="5.5" cy="8" r="1.5" />
      <circle cx="10.5" cy="8" r="1.5" />
      <circle cx="5.5" cy="13" r="1.5" />
      <circle cx="10.5" cy="13" r="1.5" />
    </svg>
  )
}

function MetricRow({ metric, countries, editing, canRemove, onRemove }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: metric.key, disabled: !editing })

  return (
    <div
      ref={setNodeRef}
      className={styles.row}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-dragging={isDragging || undefined}
      role="row"
    >
      <div className={styles.label} role="rowheader">
        <span className={styles.labelText}>
          {editing && (
            <button
              type="button"
              className={`${styles.removeButton} ${styles.removeRow}`}
              onClick={() => onRemove(metric.key)}
              disabled={!canRemove}
              aria-label={`Remove ${metric.label}`}
            >
              <RemoveIcon />
            </button>
          )}
          {metric.label}
        </span>
        {editing && (
          <button
            ref={setActivatorNodeRef}
            type="button"
            className={styles.dragHandle}
            aria-label={`Reorder ${metric.label}`}
            {...attributes}
            {...listeners}
          >
            <GripIcon />
          </button>
        )}
      </div>
      {countries.map((country, i) => (
        <div key={country.code} className={styles.value} style={{ '--i': i + 1 }} role="cell">
          {metric.format(country.metrics[metric.key])}
        </div>
      ))}
    </div>
  )
}

function ComparisonTable() {
  const [activeCodes, setActiveCodes] = useState(INITIAL_COUNTRY_CODES)
  const [activeMetricKeys, setActiveMetricKeys] = useState(INITIAL_METRIC_KEYS)
  const [editing, setEditing] = useState(false)
  const countryPickerRef = useRef(null)
  const metricPickerRef = useRef(null)
  const addCountryButtonRef = useRef(null)
  const addMetricButtonRef = useRef(null)

  // Mouse drags after a few pixels; touch needs a short hold so scrolling
  // the table does not lift a row; keyboard: Space to pick up, arrows to
  // move, Space to drop.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeCountries = activeCodes
    .map((code) => SAMPLE_COUNTRIES.find((c) => c.code === code))
    .filter(Boolean)
  const remainingCountries = SAMPLE_COUNTRIES.filter((c) => !activeCodes.includes(c.code))

  const visibleMetrics = activeMetricKeys
    .map((key) => SAMPLE_METRICS.find((m) => m.key === key))
    .filter(Boolean)
  const remainingMetrics = SAMPLE_METRICS.filter((m) => !activeMetricKeys.includes(m.key))

  const canAddCountry = remainingCountries.length > 0
  const canAddMetric = remainingMetrics.length > 0
  const canRemoveCountry = activeCountries.length > MIN_COUNTRIES
  const canRemoveMetric = visibleMetrics.length > MIN_METRICS

  const countryPickerItems = remainingCountries.map((c) => ({
    id: c.code,
    label: c.name,
    leading: c.flag,
    hint: c.code,
    keywords: [c.code, ...(c.aliases ?? [])],
  }))
  const metricPickerItems = remainingMetrics.map((m) => ({ id: m.key, label: m.label }))

  const addCountry = (item) =>
    setActiveCodes((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
  const removeCountry = (code) =>
    setActiveCodes((prev) => (prev.length > MIN_COUNTRIES ? prev.filter((c) => c !== code) : prev))
  const addMetric = (item) =>
    setActiveMetricKeys((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
  const removeMetric = (key) =>
    setActiveMetricKeys((prev) => (prev.length > MIN_METRICS ? prev.filter((k) => k !== key) : prev))

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    setActiveMetricKeys((prev) => moveItem(prev, active.id, over.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements: dragAnnouncements }}
    >
      <section
        className={styles.table}
        style={{ '--col-count': activeCountries.length }}
        data-editing={editing || undefined}
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
              {editing && (
                <button
                  type="button"
                  className={`${styles.removeButton} ${styles.removeColumn}`}
                  onClick={() => removeCountry(country.code)}
                  disabled={!canRemoveCountry}
                  aria-label={`Remove ${country.name}`}
                >
                  <RemoveIcon />
                </button>
              )}
            </div>
          ))}
          <div className={styles.addColumnCell} role="columnheader">
            <button
              ref={addCountryButtonRef}
              type="button"
              className={styles.addColumnButton}
              onClick={() => countryPickerRef.current?.open(addCountryButtonRef.current)}
              disabled={!canAddCountry}
              aria-label="Add country"
              title="Add country"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* One row per metric: label (pinned left), then one value per country.
            Rows are sortable while editing. */}
        <SortableContext items={activeMetricKeys} strategy={verticalListSortingStrategy}>
          {visibleMetrics.map((metric) => (
            <MetricRow
              key={metric.key}
              metric={metric}
              countries={activeCountries}
              editing={editing}
              canRemove={canRemoveMetric}
              onRemove={removeMetric}
            />
          ))}
        </SortableContext>

        {/* Toolbar row: always the last row, pinned to the bottom */}
        <div className={`${styles.row} ${styles.addRow}`} role="row">
          <div className={styles.addRowCell} role="cell">
            <button
              ref={addMetricButtonRef}
              type="button"
              className={styles.addRowButton}
              onClick={() => metricPickerRef.current?.open(addMetricButtonRef.current)}
              disabled={!canAddMetric}
            >
              <PlusIcon /> Add metric
            </button>
            <button
              type="button"
              className={editing ? `${styles.editButton} ${styles.editing}` : styles.editButton}
              onClick={() => setEditing((e) => !e)}
              aria-pressed={editing}
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>

        <Picker
          ref={countryPickerRef}
          title="Add a country"
          placeholder="Search countries"
          emptyMessage="No countries match"
          items={countryPickerItems}
          onSelect={addCountry}
        />
        <Picker
          ref={metricPickerRef}
          title="Add a metric"
          placeholder="Search metrics"
          emptyMessage="No metrics match"
          items={metricPickerItems}
          onSelect={addMetric}
        />
      </section>
    </DndContext>
  )
}

export default ComparisonTable
