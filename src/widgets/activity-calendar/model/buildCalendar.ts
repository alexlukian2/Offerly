import type { Application } from '@/entities/application'
import { addDays, startOfDay, startOfWeek, toLocalDateKey } from '@/shared/lib/date'

export type CalendarDay = {
  key: string // "2026-10-09" за місцевим календарем
  date: Date
  count: number
  level: 0 | 1 | 2 | 3 | 4 // яскравість клітинки
  isFuture: boolean // дні після сьогодні в останньому тижні — порожні клітинки
}

export type Calendar = {
  weeks: CalendarDay[][] // колонки: тиждень = 7 днів, з понеділка
  months: { label: string; column: number }[] // підписи над колонками
  total: number
  currentStreak: number
  longestStreak: number
}

const monthFormatter = new Intl.DateTimeFormat('uk-UA', { month: 'short' })

// Пороги рівнів — фіксовані, а не відносні до максимуму: "4 відгуки за день" завжди виглядає однаково,
// і день з 1 відгуком не стає яскравим лише тому, що інших днів немає
function toLevel(count: number): CalendarDay['level'] {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

// Скільки відгуків надіслано щодня за останні weekCount тижнів (як "contributions" на GitHub).
// Рахуємо за датою додавання вакансії; "Хочу відгукнутись" — ще не відгук, не рахуємо
export function buildCalendar(applications: Application[], now: Date, weekCount = 53): Calendar {
  const today = startOfDay(now)
  const firstDay = addDays(startOfWeek(today), -(weekCount - 1) * 7)

  const counts = new Map<string, number>()
  for (const application of applications) {
    if (application.status === 'wishlist') continue
    const key = toLocalDateKey(new Date(application.createdAt))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const weeks: CalendarDay[][] = []
  const months: Calendar['months'] = []
  let total = 0

  for (let week = 0; week < weekCount; week++) {
    const days: CalendarDay[] = []
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = addDays(firstDay, week * 7 + weekday)
      const key = toLocalDateKey(date)
      const isFuture = date > today
      const count = isFuture ? 0 : (counts.get(key) ?? 0)
      total += count
      days.push({ key, date, count, level: toLevel(count), isFuture })
    }
    weeks.push(days)

    // Підпис місяця — над першим тижнем, у якому почався новий місяць (як на GitHub).
    // Над першою колонкою не підписуємо, якщо до наступного місяця менше 2 тижнів — інакше підписи злипнуться
    const monthStart = days.find((day) => day.date.getDate() === 1)
    if (monthStart || week === 0) {
      const label = monthFormatter.format(monthStart?.date ?? days[0].date).replace('.', '')
      const last = months.at(-1)
      if (!last || week - last.column >= 3) months.push({ label, column: week })
      else if (week === 0 || last.column === 0) months[months.length - 1] = { label, column: week }
    }
  }

  return { weeks, months, total, ...findStreaks(counts, today) }
}

// Серія — дні поспіль, коли було хоча б 1 відгук.
// Поточна: рахуємо назад від сьогодні; якщо сьогодні ще нічого — від учора (день ще не скінчився)
function findStreaks(counts: Map<string, number>, today: Date) {
  const has = (date: Date) => (counts.get(toLocalDateKey(date)) ?? 0) > 0

  let currentStreak = 0
  let cursor = has(today) ? today : addDays(today, -1)
  while (has(cursor)) {
    currentStreak += 1
    cursor = addDays(cursor, -1)
  }

  const activeDays = [...counts.keys()].filter((key) => (counts.get(key) ?? 0) > 0).sort()
  let longestStreak = 0
  let run = 0
  let previous: Date | null = null
  for (const key of activeDays) {
    const date = new Date(`${key}T00:00:00`)
    run = previous && toLocalDateKey(addDays(previous, 1)) === key ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    previous = date
  }

  return { currentStreak, longestStreak }
}
