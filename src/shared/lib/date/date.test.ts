import { describe, expect, it } from 'vitest'
import { addDays, startOfWeek, toLocalDateKey } from './date'

// Тести запускаються в поясі Europe/Kyiv (vite.config.ts → test.env.TZ)
describe('startOfWeek', () => {
  it.each([
    ['2026-10-08T12:00:00', 'четвер'],
    ['2026-10-05T00:10:00', 'понеділок, одразу після півночі'],
    ['2026-10-11T23:30:00', 'неділя, пізно ввечері'],
  ])('%s (%s) → понеділок 5 жовтня, 00:00', (input) => {
    const result = startOfWeek(new Date(input))

    expect(toLocalDateKey(result)).toBe('2026-10-05')
    expect(result.getHours()).toBe(0)
  })

  it('не змінює передану дату', () => {
    const date = new Date('2026-10-08T12:00:00')

    startOfWeek(date)

    expect(toLocalDateKey(date)).toBe('2026-10-08')
  })
})

describe('addDays', () => {
  it('через перехід на зимовий час (25.10.2026) потрапляє рівно в понеділок 00:00', () => {
    const result = addDays(new Date('2026-10-19T00:00:00'), 7)

    expect(toLocalDateKey(result)).toBe('2026-10-26')
    expect(result.getHours()).toBe(0)
  })
})

describe('toLocalDateKey', () => {
  it('бере дату за МІСЦЕВИМ календарем, а не UTC', () => {
    const justAfterMidnight = new Date('2026-10-05T00:30:00') // у Києві — 5 жовтня

    expect(toLocalDateKey(justAfterMidnight)).toBe('2026-10-05')
    expect(justAfterMidnight.toISOString().slice(0, 10)).toBe('2026-10-04') // пастка UTC
  })
})
