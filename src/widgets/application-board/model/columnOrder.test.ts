import { describe, expect, it } from 'vitest'
import { isColumnOrder, reorderColumns } from './columnOrder'

describe('isColumnOrder', () => {
  it('приймає будь-яку перестановку всіх етапів', () => {
    expect(isColumnOrder(['rejected', 'offer', 'interview', 'test', 'applied', 'wishlist'])).toBe(
      true,
    )
  })

  it('відхиляє неповний список, дублікати і сміття', () => {
    expect(isColumnOrder(['applied', 'offer'])).toBe(false)
    expect(isColumnOrder(['applied', 'applied', 'test', 'interview', 'offer', 'rejected'])).toBe(
      false,
    )
    expect(isColumnOrder('applied')).toBe(false)
    expect(isColumnOrder(null)).toBe(false)
  })
})

describe('reorderColumns', () => {
  it('ставить колонку на місце іншої, зсуваючи решту', () => {
    const order = ['wishlist', 'applied', 'test', 'interview', 'offer', 'rejected'] as const
    expect(reorderColumns(order, 'rejected', 'applied')).toEqual([
      'wishlist',
      'rejected',
      'applied',
      'test',
      'interview',
      'offer',
    ])
  })
})
