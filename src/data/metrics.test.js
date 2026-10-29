import { describe, it, expect } from 'vitest'
import { METRICS, commonYear, metricSource } from './metrics.js'

const metric = (key) => METRICS.find((m) => m.key === key)
const country = (value, year) => ({ metrics: { gini: value }, years: year ? { gini: year } : {} })

describe('commonYear', () => {
  it('picks the year most values were reported for', () => {
    const countries = [country(30, 2021), country(35, 2022), country(40, 2022)]
    expect(commonYear(metric('gini'), countries)).toBe(2022)
  })

  it('picks the later year on a tie', () => {
    expect(commonYear(metric('gini'), [country(30, 2023), country(35, 2019)])).toBe(2023)
  })

  it('ignores countries without a value', () => {
    expect(commonYear(metric('gini'), [country(null, 2015), country(35, 2022)])).toBe(2022)
  })

  it('is null when no value records a year', () => {
    expect(commonYear(metric('capital'), [{ metrics: { capital: 'Paris' }, years: {} }])).toBeNull()
  })
})

describe('metricSource', () => {
  it('names the World Bank indicator, following the source key', () => {
    expect(metricSource(metric('population'))).toEqual({ id: 'worldbank', indicator: 'SP.POP.TOTL' })
    expect(metricSource(metric('area_sq_mi'))).toEqual({ id: 'worldbank', indicator: 'AG.SRF.TOTL.K2' })
  })

  it('sends capital and currency to the catalog and the rest to the Factbook', () => {
    expect(metricSource(metric('capital')).id).toBe('catalog')
    expect(metricSource(metric('median_age')).id).toBe('factbook')
    expect(metricSource(metric('military_gdp_pct')).id).toBe('factbook')
  })
})
