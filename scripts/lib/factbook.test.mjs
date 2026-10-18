import { describe, it, expect } from 'vitest'
import { extractFactbook, latestYearText, parseMeasure, regionFolder } from './factbook.mjs'

describe('parseMeasure', () => {
  it('reads a value and an estimate year', () => {
    expect(parseMeasure('46.9 years (2025 est.)')).toEqual({ value: 46.9, year: 2025 })
    expect(parseMeasure('77.8% of total population (2023)')).toEqual({ value: 77.8, year: 2023 })
  })
  it('handles thousands separators, negatives and no year', () => {
    expect(parseMeasure('2,389 km')).toEqual({ value: 2389, year: null })
    expect(parseMeasure('-0.2% (2024 est.)')).toEqual({ value: -0.2, year: 2024 })
    expect(parseMeasure('0 km (landlocked)')).toEqual({ value: 0, year: null })
  })
  it('takes the first number, not later ones', () => {
    expect(parseMeasure('3 deaths/1,000 live births (2025 est.)')).toEqual({ value: 3, year: 2025 })
    expect(parseMeasure('Zugspitze 2,963 m')).toEqual({ value: 2963, year: null })
  })
  it('returns null for missing or non-numeric text', () => {
    expect(parseMeasure(undefined)).toBeNull()
    expect(parseMeasure('NA')).toBeNull()
  })
})

describe('latestYearText', () => {
  it('picks the most recent year and ignores notes', () => {
    expect(latestYearText({
      'Inflation rate (consumer prices) 2023': '5.9% (2023 est.)',
      'Inflation rate (consumer prices) 2024': '2.3% (2024 est.)',
      note: '<b>note:</b> something',
    })).toBe('2.3% (2024 est.)')
  })
  it('returns null when there are no year keys', () => {
    expect(latestYearText({ note: 'x' })).toBeNull()
    expect(latestYearText(undefined)).toBeNull()
  })
})

describe('extractFactbook', () => {
  it('reads a profile into metrics and years', () => {
    const profile = {
      Geography: { Coastline: { text: '2,389 km' }, Elevation: { 'highest point': { text: 'Zugspitze 2,963 m' } } },
      'People and Society': { 'Median age': { total: { text: '46.9 years (2025 est.)' } } },
      Economy: { 'Real GDP growth rate': { 'Real GDP growth rate 2024': '-0.2% (2024 est.)' } },
      Government: { 'Government type': { text: 'federal parliamentary republic' } },
    }
    const { metrics, years } = extractFactbook(profile)
    expect(metrics.median_age).toBe(46.9)
    expect(years.median_age).toBe(2025)
    expect(metrics.coastline_km).toBe(2389)
    expect(metrics.highest_point_m).toBe(2963)
    expect(metrics.gdp_growth_pct).toBe(-0.2)
    expect(metrics.government_type).toBe('federal parliamentary republic')
    expect(metrics.airports).toBeNull()
  })
})

describe('regionFolder', () => {
  it('maps codes.csv region names to repository folders', () => {
    expect(regionFolder('Europe')).toBe('europe')
    expect(regionFolder('East & Southeast Asia')).toBe('east-n-southeast-asia')
    expect(regionFolder('Central America and Caribbean')).toBe('central-america-n-caribbean')
    expect(regionFolder('Australia-Oceania')).toBe('australia-oceania')
    expect(regionFolder('Middle East')).toBe('middle-east')
  })
})
