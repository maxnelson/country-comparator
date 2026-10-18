import { describe, it, expect } from 'vitest'
import { DEFAULT_CODES, DEFAULT_METRIC_KEYS, buildSearch, parseSearch, titleFor } from './urlState.js'

const DEFAULT_SEARCH = `?countries=us-jp-de&metrics=${DEFAULT_METRIC_KEYS.join('-')}`

describe('parseSearch', () => {
  it('returns the defaults for an empty query', () => {
    expect(parseSearch('')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
    expect(parseSearch('?')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
  })

  it('keeps the given order and normalises case', () => {
    expect(parseSearch('?countries=fr-CA-jp&metrics=Capital-currency')).toEqual({
      codes: ['FR', 'CA', 'JP'],
      metricKeys: ['capital', 'currency'],
    })
  })

  it('drops unknown ids and duplicates', () => {
    const parsed = parseSearch('?countries=fr-xx-fr-ca&metrics=capital-nope-capital')
    expect(parsed.codes).toEqual(['FR', 'CA'])
    expect(parsed.metricKeys).toEqual(['capital'])
  })

  it('falls back to the defaults when nothing valid remains', () => {
    expect(parseSearch('?countries=xx&metrics=nope')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
    expect(parseSearch('?countries=&metrics=')).toEqual({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })
  })

  it('still reads the earlier short parameters and commas', () => {
    expect(parseSearch('?c=FR,CA&m=capital,currency')).toEqual({
      codes: ['FR', 'CA'],
      metricKeys: ['capital', 'currency'],
    })
    expect(parseSearch('?c=FR%2CCA').codes).toEqual(['FR', 'CA'])
  })
})

describe('buildSearch', () => {
  it('always writes both parameters, lowercase and hyphen-separated', () => {
    expect(buildSearch({ codes: DEFAULT_CODES, metricKeys: DEFAULT_METRIC_KEYS })).toBe(DEFAULT_SEARCH)
    expect(buildSearch({ codes: ['CA'], metricKeys: ['capital', 'currency'] })).toBe(
      '?countries=ca&metrics=capital-currency',
    )
  })

  it('round-trips through parseSearch', () => {
    const state = { codes: ['CA', 'FR', 'IN'], metricKeys: ['currency', 'population', 'gdp_per_capita'] }
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
