import { useSearchParams } from 'react-router'
import { z } from 'zod'
import type { Application } from '@/entities/application'
import { addDays, startOfDay } from '@/shared/lib/date'

export const PERIODS = ['7', '30', '90', 'all'] as const
export type Period = (typeof PERIODS)[number]

export const PERIOD_LABELS: Record<Period, string> = {
  '7': '7 днів',
  '30': '30 днів',
  '90': '3 місяці',
  all: 'Увесь час',
}

// Для підпису тренду: "+4 порівняно з попередніми 30 днями" (орудний відмінок)
export const PERIOD_PHRASES: Record<Period, string> = {
  '7': 'попередніми 7 днями',
  '30': 'попередніми 30 днями',
  '90': 'попередніми 3 місяцями',
  all: '',
}

const DEFAULT_PERIOD: Period = '30'
const periodSchema = z.enum(PERIODS).catch(DEFAULT_PERIOD)

// Період живе в адресі (?period=90), як і фільтри дошки: посиланням можна поділитися,
// "Назад" повертає попередній вибір. Сміття в адресі → 30 днів (.catch)
export function usePeriod() {
  const [searchParams, setSearchParams] = useSearchParams()
  const period = periodSchema.parse(searchParams.get('period') ?? undefined)

  function setPeriod(next: Period) {
    setSearchParams(
      (params) => {
        if (next === DEFAULT_PERIOD) params.delete('period')
        else params.set('period', next)
        return params
      },
      { replace: true },
    )
  }

  return [period, setPeriod] as const
}

export function periodDays(period: Period): number | null {
  return period === 'all' ? null : Number(period)
}

// Вакансії, додані в межах періоду. offset = 1 — попереднє "вікно" такої ж довжини (для тренду):
// для 30 днів це дні 31–60 тому
export function inPeriod(applications: Application[], period: Period, now: Date, offset = 0) {
  const days = periodDays(period)
  if (days === null) return offset === 0 ? applications : []

  const end = addDays(startOfDay(now), 1 - offset * days) // не включно: завтра 00:00
  const start = addDays(end, -days)
  return applications.filter((application) => {
    const created = new Date(application.createdAt)
    return created >= start && created < end
  })
}

export function countSent(applications: Application[]) {
  return applications.filter((application) => application.status !== 'wishlist').length
}
