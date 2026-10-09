import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import { buildCalendar } from './buildCalendar'

// Пояс тестів — Europe/Kyiv. 9 жовтня 2026 — п'ятниця
const now = new Date('2026-10-09T18:00:00+03:00')

let id = 0
function sent(date: string, status: Application['status'] = 'applied'): Application {
  id += 1
  return { id: String(id), company: 'C', position: 'P', status, workFormat: 'remote', createdAt: new Date(`${date}T12:00:00+03:00`).toISOString() }
}

describe('buildCalendar', () => {
  const applications = [
    sent('2026-10-09'),
    sent('2026-10-08'),
    sent('2026-10-08'),
    sent('2026-10-07'),
    sent('2026-10-01'),
    sent('2026-10-01'),
    sent('2026-10-01'),
    sent('2026-09-28'),
    sent('2026-09-27'),
    sent('2026-09-26'),
    sent('2026-09-25'),
    sent('2026-10-09', 'wishlist'), // не відгук
  ]
  const calendar = buildCalendar(applications, now)

  it('53 тижні по 7 днів, останній тиждень — поточний, дні після сьогодні — майбутні', () => {
    expect(calendar.weeks).toHaveLength(53)
    const lastWeek = calendar.weeks.at(-1)!
    expect(lastWeek[0].key).toBe('2026-10-05') // понеділок
    expect(lastWeek[4]).toMatchObject({ key: '2026-10-09', count: 1, isFuture: false })
    expect(lastWeek[5].isFuture).toBe(true)
  })

  it('рахує відгуки по днях і рівні яскравості', () => {
    const days = calendar.weeks.flat()
    expect(days.find((day) => day.key === '2026-10-08')).toMatchObject({ count: 2, level: 2 })
    expect(days.find((day) => day.key === '2026-10-01')).toMatchObject({ count: 3, level: 3 })
    expect(calendar.total).toBe(11)
  })

  it('поточна серія — 3 дні (7–9 жовт.), найдовша — 4 (25–28 вер.)', () => {
    expect(calendar.currentStreak).toBe(3)
    expect(calendar.longestStreak).toBe(4)
  })

  it('серія не обривається, якщо сьогодні ще нічого не надіслано', () => {
    expect(buildCalendar([sent('2026-10-08'), sent('2026-10-07')], now).currentStreak).toBe(2)
  })

  it('підписи місяців — без злипання', () => {
    const columns = calendar.months.map(({ column }) => column)
    expect(columns.every((column, index) => index === 0 || column - columns[index - 1] >= 3)).toBe(true)
    expect(calendar.months.at(-1)?.label).toBe('жовт')
  })
})
