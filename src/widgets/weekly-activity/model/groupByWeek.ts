import type { Application } from '@/entities/application'
import { addDays, startOfWeek, toLocalDateKey } from '@/shared/lib/date'

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
