import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import { groupByWeek } from './groupByWeek'

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
