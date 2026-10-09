import { addDays, startOfDay } from '@/shared/lib/date'
import type { Application } from './types'

// ── Поле <input type="datetime-local"> ──────────────────────────────────────
// Воно працює з МІСЦЕВИМ часом без поясу: "2026-10-10T10:00". У базі — точний момент (ISO з поясом).
// Ці дві функції — міст між ними

export function toLocalInputValue(iso: string): string {
  const date = new Date(iso)
  // toISOString дає UTC; зсуваємо на різницю поясів, щоб отримати місцеві години
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function fromLocalInputValue(value: string): string {
  // new Date('2026-10-10T10:00') без поясу браузер розуміє як МІСЦЕВИЙ час — саме те, що треба
  return new Date(value).toISOString()
}

// ── Швидкі варіанти ────────────────────────────────────────────────────────

const MORNING_HOUR = 10

function atMorning(daysFromToday: number, now: Date) {
  const date = addDays(startOfDay(now), daysFromToday)
  date.setHours(MORNING_HOUR)
  return date
}

export function getReminderPresets(now = new Date()) {
  return [
    { label: 'Завтра 10:00', date: atMorning(1, now) },
    { label: 'Через 3 дні', date: atMorning(3, now) },
    { label: 'Через тиждень', date: atMorning(7, now) },
  ]
}

// ── Стан нагадувань ────────────────────────────────────────────────────────

// Нагадування, що вже настали, — від найстарішого
export function getDueReminders(applications: Application[], now: Date): Application[] {
  return applications
    .filter((application) => application.remindAt && new Date(application.remindAt) <= now)
    .sort((a, b) => a.remindAt!.localeCompare(b.remindAt!))
}

// Найближчий момент у майбутньому, коли спрацює наступне нагадування (або null)
export function getNextReminderTime(applications: Application[], now: Date): Date | null {
  const upcoming = applications
    .map((application) => (application.remindAt ? new Date(application.remindAt) : null))
    .filter((date): date is Date => date !== null && date > now)
    .sort((a, b) => a.getTime() - b.getTime())
  return upcoming[0] ?? null
}

// ── Підпис для людини ──────────────────────────────────────────────────────

const timeFormatter = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' })

// "сьогодні о 15:30", "завтра о 10:00", "12 жовт. о 10:00"
export function formatReminder(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000)
  const day =
    days === 0 ? 'сьогодні' : days === 1 ? 'завтра' : days === -1 ? 'вчора' : dayFormatter.format(date)
  return `${day} о ${timeFormatter.format(date)}`
}
