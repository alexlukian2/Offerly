import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import { countSent, inPeriod } from './period'

const now = new Date('2026-10-09T12:00:00+03:00')

function app(id: string, daysAgo: number, status: Application['status'] = 'applied'): Application {
  const created = new Date(now)
  created.setDate(created.getDate() - daysAgo)
  return { id, company: id, position: 'Dev', status, workFormat: 'remote', createdAt: created.toISOString() }
}

const list = [app('today', 0), app('d6', 6), app('d7', 7), app('d10', 10), app('d40', 40, 'wishlist')]

describe('inPeriod', () => {
  it('7 днів = сьогодні й 6 попередніх', () => {
    expect(inPeriod(list, '7', now).map(({ id }) => id)).toEqual(['today', 'd6'])
  })

  it('попереднє вікно такої ж довжини — для тренду', () => {
    expect(inPeriod(list, '7', now, 1).map(({ id }) => id)).toEqual(['d7', 'd10'])
  })

  it('"увесь час" — усе; попереднього вікна немає', () => {
    expect(inPeriod(list, 'all', now)).toHaveLength(5)
    expect(inPeriod(list, 'all', now, 1)).toEqual([])
  })
})

describe('countSent', () => {
  it('не рахує "Хочу відгукнутись"', () => {
    expect(countSent(list)).toBe(4)
  })
})
