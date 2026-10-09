import type { Application } from '@/entities/application'
import { addDays, startOfDay, startOfWeek, toLocalDateKey } from '@/shared/lib/date'

export type WeekBucket = {
  key: string // "2026-09-28" — понеділок тижня, за локальним календарем
  start: Date
  count: number
  isCurrent: boolean
}

// "Зараз" передається параметром, а не береться всередині через new Date():
// так функція чиста — однаковий вхід завжди дає однаковий результат.
export function groupByWeek(applications: Application[], now: Date, weekCount = 8): WeekBucket[] {
  const currentWeekStart = startOfWeek(now)

  // Спершу створюємо ВСІ тижні з нулями — щоб тижні без відгуків теж були на графіку
  const buckets: WeekBucket[] = Array.from({ length: weekCount }, (_, index) => {
    const start = addDays(currentWeekStart, (index - (weekCount - 1)) * 7)
    return { key: toLocalDateKey(start), start, count: 0, isCurrent: index === weekCount - 1 }
  })

  // Map: швидкий пошук тижня за ключем замість перебору масиву для кожної вакансії
  const bucketsByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const application of applications) {
    if (application.status === 'wishlist') continue // ще не відгукувався

    const weekKey = toLocalDateKey(startOfWeek(new Date(application.createdAt)))
    const bucket = bucketsByKey.get(weekKey)
    if (bucket) bucket.count += 1 // старші за 8 тижнів — просто не потрапляють у графік
  }

  return buckets
}

export type ActivityBucket = {
  key: string
  start: Date
  count: number
  isCurrent: boolean
}

export type Activity = { unit: 'day' | 'week'; buckets: ActivityBucket[] }

// Групування під вибраний період: до 30 днів — по днях (видно ритм), довше — по тижнях
// (по днях було б 90+ тонких стовпчиків). days = null — "увесь час": тижні від першого відгуку
export function groupActivity(applications: Application[], now: Date, days: number | null): Activity {
  if (days !== null && days <= 31) {
    return { unit: 'day', buckets: groupByDay(applications, now, days) }
  }

  let weekCount = days === null ? 8 : Math.ceil(days / 7)
  if (days === null) {
    const sent = applications.filter((application) => application.status !== 'wishlist')
    const first = sent.reduce<Date | null>((min, application) => {
      const date = new Date(application.createdAt)
      return min === null || date < min ? date : min
    }, null)
    if (first) {
      const weeksSinceFirst = Math.round((startOfWeek(now).getTime() - startOfWeek(first).getTime()) / (7 * 86_400_000)) + 1
      weekCount = Math.min(Math.max(weeksSinceFirst, 8), 52)
    }
  }
  return { unit: 'week', buckets: groupByWeek(applications, now, weekCount) }
}

function groupByDay(applications: Application[], now: Date, dayCount: number): ActivityBucket[] {
  const today = startOfDay(now)
  const buckets = Array.from({ length: dayCount }, (_, index) => {
    const start = addDays(today, index - (dayCount - 1))
    return { key: toLocalDateKey(start), start, count: 0, isCurrent: index === dayCount - 1 }
  })
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  for (const application of applications) {
    if (application.status === 'wishlist') continue
    const bucket = byKey.get(toLocalDateKey(new Date(application.createdAt)))
    if (bucket) bucket.count += 1
  }
  return buckets
}
