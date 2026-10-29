import { describe, it, expect } from 'vitest'
import { pageFromSearch, pageHref } from './page.js'

describe('pageFromSearch', () => {
  it('reads a known page', () => {
    expect(pageFromSearch('?page=methodology')).toBe('methodology')
    expect(pageFromSearch('?page=sources')).toBe('sources')
  })

  it('is null for the comparison and for unknown pages', () => {
    expect(pageFromSearch('')).toBeNull()
    expect(pageFromSearch('?countries=fr-ca&metrics=capital')).toBeNull()
    expect(pageFromSearch('?page=nope')).toBeNull()
    expect(pageFromSearch('?page=toString')).toBeNull()
  })
})

describe('pageHref', () => {
  it('links under the base path', () => {
    expect(pageHref('sources')).toBe('/?page=sources')
  })
})
