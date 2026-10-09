import { describe, expect, it } from 'vitest'
import type { Application } from './types'
import {
  formatReminder,
  fromLocalInputValue,
  getDueReminders,
  getNextReminderTime,
  getReminderPresets,
  toLocalInputValue,
} from './reminder'

// Пояс тестів — Europe/Kyiv (vite.config.ts), у жовтні це UTC+3
const now = new Date('2026-10-09T12:00:00+03:00')

function app(id: string, remindAt?: string): Application {
  return { id, company: id, position: 'Dev', status: 'applied', workFormat: 'remote', createdAt: now.toISOString(), remindAt }
}

describe('datetime-local ↔ ISO', () => {
  it('ISO → місцевий час для поля і назад', () => {
    expect(toLocalInputValue('2026-10-10T07:00:00.000Z')).toBe('2026-10-10T10:00')
    expect(fromLocalInputValue('2026-10-10T10:00')).toBe('2026-10-10T07:00:00.000Z')
  })
})

describe('getReminderPresets', () => {
  it('завтра, через 3 дні й через тиждень — о 10:00 місцевого часу', () => {
    expect(getReminderPresets(now).map(({ date }) => toLocalInputValue(date.toISOString()))).toEqual([
      '2026-10-10T10:00',
      '2026-10-12T10:00',
      '2026-10-16T10:00',
    ])
  })
})

describe('getDueReminders / getNextReminderTime', () => {
  const list = [
    app('future', '2026-10-09T15:00:00+03:00'),
    app('none'),
    app('due-late', '2026-10-09T11:00:00+03:00'),
    app('due-early', '2026-10-08T09:00:00+03:00'),
  ]

  it('повертає лише ті, що настали, — від найстарішого', () => {
    expect(getDueReminders(list, now).map(({ id }) => id)).toEqual(['due-early', 'due-late'])
  })

  it('знаходить найближче майбутнє нагадування', () => {
    expect(getNextReminderTime(list, now)?.toISOString()).toBe('2026-10-09T12:00:00.000Z')
    expect(getNextReminderTime([app('none')], now)).toBeNull()
  })
})

describe('formatReminder', () => {
  it('сьогодні / завтра / дата', () => {
    expect(formatReminder('2026-10-09T15:30:00+03:00', now)).toBe('сьогодні о 15:30')
    expect(formatReminder('2026-10-10T10:00:00+03:00', now)).toBe('завтра о 10:00')
    expect(formatReminder('2026-10-16T10:00:00+03:00', now)).toMatch(/^16 жовт\.? о 10:00$/)
  })
})
