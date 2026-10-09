import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import { groupActivity, groupByWeek } from './groupByWeek'

function sentAt(createdAt: string, status: Application['status'] = 'applied'): Application {
  return { id: createdAt, company: 'C', position: 'P', status, workFormat: 'remote', createdAt }
}

// "Зараз" передаємо параметром — тож результат не залежить від дня, коли запущено тест
const now = new Date('2026-10-08T12:00:00')

describe('groupByWeek', () => {
  it('створює 8 тижнів (з порожніми), останній — поточний', () => {
    const weeks = groupByWeek([], now)

    expect(weeks).toHaveLength(8)
    expect(weeks.at(-1)).toMatchObject({ key: '2026-10-05', isCurrent: true, count: 0 })
    expect(weeks[0].key).toBe('2026-08-17')
  })

  it('розкладає відгуки по тижнях і пропускає "хочу відгукнутись"', () => {
    const weeks = groupByWeek(
      [
        sentAt('2026-10-06T10:00:00'),
        sentAt('2026-10-07T10:00:00'),
        sentAt('2026-09-29T10:00:00'),
        sentAt('2026-10-07T11:00:00', 'wishlist'),
      ],
      now,
    )

    expect(weeks.find((week) => week.key === '2026-10-05')?.count).toBe(2)
    expect(weeks.find((week) => week.key === '2026-09-28')?.count).toBe(1)
  })

  it('ігнорує відгуки старші за 8 тижнів', () => {
    const total = groupByWeek([sentAt('2026-01-01T10:00:00')], now).reduce(
      (sum, week) => sum + week.count,
      0,
    )

    expect(total).toBe(0)
  })
})

describe('groupActivity', () => {
  const now = new Date('2026-10-09T12:00:00+03:00')
  const app = (id: string, date: string): Application => ({
    id, company: id, position: 'Dev', status: 'applied', workFormat: 'remote', createdAt: new Date(`${date}T12:00:00+03:00`).toISOString(),
  })

  it('7 і 30 днів — по днях, останній — сьогодні', () => {
    const activity = groupActivity([app('a', '2026-10-09'), app('b', '2026-10-09'), app('c', '2026-10-03')], now, 7)
    expect(activity.unit).toBe('day')
    expect(activity.buckets.map(({ count }) => count)).toEqual([1, 0, 0, 0, 0, 0, 2])
    expect(groupActivity([], now, 30).buckets).toHaveLength(30)
  })

  it('3 місяці — 13 тижнів; увесь час — від першого відгуку, але не менше 8 тижнів', () => {
    expect(groupActivity([], now, 90)).toMatchObject({ unit: 'week' })
    expect(groupActivity([], now, 90).buckets).toHaveLength(13)
    expect(groupActivity([app('old', '2026-05-04')], now, null).buckets).toHaveLength(23)
    expect(groupActivity([app('new', '2026-10-01')], now, null).buckets).toHaveLength(8)
  })
})
