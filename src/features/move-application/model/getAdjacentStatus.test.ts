import { describe, expect, it } from 'vitest'
import { getAdjacentStatus } from './getAdjacentStatus'

describe('getAdjacentStatus', () => {
  it('повертає сусідні етапи', () => {
    expect(getAdjacentStatus('applied', 'next')).toBe('test')
    expect(getAdjacentStatus('applied', 'prev')).toBe('wishlist')
  })

  it('на краях повертає undefined', () => {
    expect(getAdjacentStatus('wishlist', 'prev')).toBeUndefined()
    expect(getAdjacentStatus('rejected', 'next')).toBeUndefined()
  })
})
