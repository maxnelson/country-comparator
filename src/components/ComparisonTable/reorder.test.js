import { describe, it, expect } from 'vitest'
import { moveItem } from './reorder.js'

const list = ['a', 'b', 'c', 'd']

describe('moveItem', () => {
  it('moves an item down to the target position', () => {
    expect(moveItem(list, 'a', 'c')).toEqual(['b', 'c', 'a', 'd'])
  })
  it('moves an item up to the target position', () => {
    expect(moveItem(list, 'd', 'b')).toEqual(['a', 'd', 'b', 'c'])
  })
  it('returns the same array for a no-op or unknown ids', () => {
    expect(moveItem(list, 'b', 'b')).toBe(list)
    expect(moveItem(list, 'zz', 'b')).toBe(list)
    expect(moveItem(list, 'a', 'zz')).toBe(list)
  })
  it('does not mutate the input', () => {
    moveItem(list, 'a', 'd')
    expect(list).toEqual(['a', 'b', 'c', 'd'])
  })
})
