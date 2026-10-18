import { useEffect, useRef, useState } from 'react'
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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { COUNTRIES } from '../../data/countries.js'
import { METRICS, metricValue } from '../../data/metrics.js'
import Picker from '../Picker/Picker.jsx'
import { buildSearch, parseSearch, titleFor } from '../../state/urlState.js'
import { moveItem } from './reorder.js'
import styles from './ComparisonTable.module.css'

const MIN_COUNTRIES = 1
const MIN_METRICS = 1

const metricLabel = (key) => METRICS.find((m) => m.key === key)?.label ?? key
const countryName = (code) => COUNTRIES.find((c) => c.code === code)?.name ?? code

// Screen-reader announcements for drag and drop, using names instead of ids
const announcementsFor = (nameOf, kind) => ({
  onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
  onDragOver: ({ active, over }) =>
    over
      ? `${nameOf(active.id)} is over ${nameOf(over.id)}.`
      : `${nameOf(active.id)} is no longer over a ${kind}.`,
  onDragEnd: ({ active, over }) =>
    over
      ? `${nameOf(active.id)} was moved to the position of ${nameOf(over.id)}.`
      : `${nameOf(active.id)} was dropped.`,
  onDragCancel: ({ active }) => `Reordering ${nameOf(active.id)} was cancelled.`,
})
const rowAnnouncements = announcementsFor(metricLabel, 'row')
const columnAnnouncements = announcementsFor(countryName, 'column')

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
              ref={setActivatorNodeRef}
              type="button"
              className={`${styles.handle} ${styles.rowHandle}`}
              aria-label={`Reorder ${metric.label}`}
              {...attributes}
              {...listeners}
            >
              <GripIcon />
            </button>
          )}
          {metric.label}
        </span>
      </div>
      {countries.map((country, i) => (
        <div
          key={country.code}
          className={styles.value}
          style={{
            '--i': i + 1,
            // Follow the column's header cell while a column is being dragged
            transform: `var(--col-transform-${i + 1}, none)`,
            transition: `var(--col-transition-${i + 1}, none)`,
            backgroundColor: `var(--col-bg-${i + 1}, transparent)`,
          }}
          role="cell"
        >
          {metric.format(metricValue(metric, country))}
        </div>
      ))}
      {/* The add-country lane continues down every row; it holds the delete button while editing */}
      <div className={styles.lane} role="cell" aria-hidden={editing ? undefined : true}>
        {editing && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(metric.key)}
            disabled={!canRemove}
            aria-label={`Remove ${metric.label}`}
          >
            <RemoveIcon />
          </button>
        )}
      </div>
    </div>
  )
}

function CountryHeader({ country, index, editing, canRemove, onRemove, tableRef }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: country.code, disabled: !editing })
  const col = index + 1
  const transformString = CSS.Translate.toString(transform)

  // A column is one header cell plus a value cell per row. The header cell is
  // the sortable item; its shift is mirrored onto the value cells through CSS
  // variables on the table, so the whole column moves as one.
  useEffect(() => {
    const table = tableRef.current
    if (!table) return
    table.style.setProperty(`--col-transform-${col}`, transformString ?? 'none')
    table.style.setProperty(`--col-transition-${col}`, transition ?? 'none')
    table.style.setProperty(`--col-bg-${col}`, isDragging ? 'var(--mint-50)' : 'transparent')
    return () => {
      table.style.removeProperty(`--col-transform-${col}`)
      table.style.removeProperty(`--col-transition-${col}`)
      table.style.removeProperty(`--col-bg-${col}`)
    }
  }, [tableRef, col, transformString, transition, isDragging])

  return (
    <div
      ref={setNodeRef}
      className={styles.headerCell}
      style={{ '--i': col, transform: transformString, transition }}
      data-dragging={isDragging || undefined}
      role="columnheader"
    >
      <span className={styles.flag} role="img" aria-label={`${country.name} flag`}>
        {country.flag}
      </span>
      <span className={styles.countryName}>{country.name}</span>
      {editing && (
        <>
          <button
            ref={setActivatorNodeRef}
            type="button"
            className={`${styles.handle} ${styles.columnHandle}`}
            aria-label={`Reorder ${country.name}`}
            {...attributes}
            {...listeners}
          >
            <GripIcon />
          </button>
          <button
            type="button"
            className={`${styles.removeButton} ${styles.removeColumn}`}
            onClick={() => onRemove(country.code)}
            disabled={!canRemove}
            aria-label={`Remove ${country.name}`}
          >
            <RemoveIcon />
          </button>
        </>
      )}
    </div>
  )
}

function ComparisonTable() {
  // The comparison starts from the URL and is written back to it on every change
  const [activeCodes, setActiveCodes] = useState(() => parseSearch(window.location.search).codes)
  const [activeMetricKeys, setActiveMetricKeys] = useState(
    () => parseSearch(window.location.search).metricKeys,
  )
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const search = buildSearch({ codes: activeCodes, metricKeys: activeMetricKeys })
    const { pathname, hash } = window.location
    if (window.location.search !== search) {
      window.history.replaceState(null, '', `${pathname}${search}${hash}`)
    }
    document.title = titleFor(activeCodes)
  }, [activeCodes, activeMetricKeys])

  // Back/forward between differing URLs re-reads the comparison
  useEffect(() => {
    const handlePopState = () => {
      const next = parseSearch(window.location.search)
      setActiveCodes(next.codes)
      setActiveMetricKeys(next.metricKeys)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const tableRef = useRef(null)
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
    .map((code) => COUNTRIES.find((c) => c.code === code))
    .filter(Boolean)
  const remainingCountries = COUNTRIES.filter((c) => !activeCodes.includes(c.code))

  const visibleMetrics = activeMetricKeys
    .map((key) => METRICS.find((m) => m.key === key))
    .filter(Boolean)
  const remainingMetrics = METRICS.filter((m) => !activeMetricKeys.includes(m.key))

  const canAddCountry = remainingCountries.length > 0
  const canAddMetric = remainingMetrics.length > 0
  const canRemoveCountry = activeCountries.length > MIN_COUNTRIES
  const canRemoveMetric = visibleMetrics.length > MIN_METRICS

  const countryPickerItems = remainingCountries.map((c) => ({
    id: c.code,
    label: c.name,
    leading: c.flag,
    hint: c.code,
    keywords: [c.code, c.code3, ...(c.aliases ?? [])],
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

  const handleRowDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    setActiveMetricKeys((prev) => moveItem(prev, active.id, over.id))
  }

  const handleColumnDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    setActiveCodes((prev) => moveItem(prev, active.id, over.id))
  }

  return (
    <section
      ref={tableRef}
      className={styles.table}
      style={{ '--col-count': activeCountries.length }}
      data-editing={editing || undefined}
      role="table"
      aria-label="Country comparison"
    >
    {/* Header row: pinned to the top. Flags + names (sortable while editing),
        then the add-country cell pinned right. */}
    <div className={`${styles.row} ${styles.headerRow}`} role="row">
      <div className={styles.corner} role="columnheader" aria-label="Metric" />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
        onDragEnd={handleColumnDragEnd}
        accessibility={{ announcements: columnAnnouncements }}
      >
        <SortableContext items={activeCodes} strategy={horizontalListSortingStrategy}>
          {activeCountries.map((country, i) => (
            <CountryHeader
              key={country.code}
              country={country}
              index={i}
              editing={editing}
              canRemove={canRemoveCountry}
              onRemove={removeCountry}
              tableRef={tableRef}
            />
          ))}
        </SortableContext>
      </DndContext>
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleRowDragEnd}
        accessibility={{ announcements: rowAnnouncements }}
      >
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
      </DndContext>

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
  )
}

export default ComparisonTable
