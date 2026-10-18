import { describe, it, expect } from 'vitest'
import { filterItems, rank } from './filter.js'

const items = [
  { id: 'US', label: 'United States', keywords: ['US', 'USA', 'America'] },
  { id: 'GB', label: 'United Kingdom', keywords: ['GB', 'UK', 'Britain'] },
  { id: 'AE', label: 'United Arab Emirates', keywords: ['AE', 'UAE'] },
  { id: 'ST', label: 'São Tomé and Príncipe', keywords: ['ST'] },
  { id: 'AU', label: 'Australia', keywords: ['AU'] },
]

describe('rank', () => {
  it('returns 0 for every item when the query is empty', () => {
    expect(items.map((i) => rank(i, ''))).toEqual([0, 0, 0, 0, 0])
  })
  it('returns -1 when nothing matches', () => {
    expect(rank(items[0], 'zz')).toBe(-1)
  })
})

describe('filterItems', () => {
  it('keeps the original order when the query is empty', () => {
    expect(filterItems(items, '').map((i) => i.id)).toEqual(['US', 'GB', 'AE', 'ST', 'AU'])
  })
  it('puts label-prefix matches before alias matches', () => {
    expect(filterItems(items, 'u').map((i) => i.id)).toEqual(['US', 'GB', 'AE', 'AU'])
  })
  it('matches exact codes and aliases', () => {
    expect(filterItems(items, 'uk').map((i) => i.id)).toEqual(['GB'])
    expect(filterItems(items, 'uae').map((i) => i.id)).toEqual(['AE'])
  })
  it('matches a later word in the label', () => {
    expect(filterItems(items, 'king').map((i) => i.id)).toEqual(['GB'])
  })
  it('ignores case and accents', () => {
    expect(filterItems(items, 'SAO TOME').map((i) => i.id)).toEqual(['ST'])
  })
})
