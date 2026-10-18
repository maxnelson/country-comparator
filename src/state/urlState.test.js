import { describe, it, expect } from 'vitest'
import { DEFAULT_CODES, DEFAULT_METRIC_KEYS, buildSearch, parseSearch, titleFor } from './urlState.js'

describe('parseSearch', () => {
  it('returns the defaults for an empty query', () => {
    expect(parseSearch('')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
    expect(parseSearch('?')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
  })

  it('keeps the given order and normalises case', () => {
    expect(parseSearch('?c=fr,CA,jp&m=Capital,currency')).toEqual({
      codes: ['FR', 'CA', 'JP'],
      metricKeys: ['capital', 'currency'],
    })
  })

  it('drops unknown ids and duplicates', () => {
    expect(parseSearch('?c=FR,XX,FR,CA&m=capital,nope,capital').codes).toEqual(['FR', 'CA'])
    expect(parseSearch('?c=FR,XX,FR,CA&m=capital,nope,capital').metricKeys).toEqual(['capital'])
  })

  it('falls back to the defaults when nothing valid remains', () => {
    expect(parseSearch('?c=XX&m=nope')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
    expect(parseSearch('?c=&m=')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
  })

  it('accepts encoded commas', () => {
    expect(parseSearch('?c=FR%2CCA').codes).toEqual(['FR', 'CA'])
  })
})

describe('buildSearch', () => {
  it('writes nothing for the default view', () => {
    expect(buildSearch({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })).toBe('')
  })

  it('writes only the parameters that differ from the defaults', () => {
    expect(buildSearch({ codes: ['FR', 'CA'], metricKeys: DEFAULT_METRIC_KEYS })).toBe('?c=FR,CA')
    expect(buildSearch({ codes: DEFAULT_CODES, metricKeys: ['capital'] })).toBe('?m=capital')
    expect(buildSearch({ codes: ['CA'], metricKeys: ['capital', 'currency'] })).toBe(
      '?c=CA&m=capital,currency',
    )
  })

  it('treats a reordered default as a change', () => {
    expect(buildSearch({ codes: ['JP', 'US', 'DE'], metricKeys: DEFAULT_METRIC_KEYS })).toBe('?c=JP,US,DE')
  })

  it('round-trips through parseSearch', () => {
    const state = { codes: ['CA', 'FR', 'IN'], metricKeys: ['currency', 'population'] }
    expect(parseSearch(buildSearch(state))).toEqual(state)
  })
})

describe('titleFor', () => {
  it('joins up to three names with vs', () => {
    expect(titleFor(['US', 'JP'])).toBe('United States vs Japan · Country Comparator')
  })
  it('summarises longer lists', () => {
    expect(titleFor(['US', 'JP', 'DE', 'FR', 'CA'])).toBe('United States vs Japan and 3 more · Country Comparator')
  })
})
