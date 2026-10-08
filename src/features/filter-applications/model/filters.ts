import { z } from 'zod'
import type { Application, WorkFormat } from '@/entities/application'

export const SORT_ORDERS = ['newest', 'oldest', 'company'] as const
export type SortOrder = (typeof SORT_ORDERS)[number]

export const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Спочатку нові',
  oldest: 'Спочатку старі',
  company: 'За компанією (А–Я)',
}

const WORK_FORMAT_FILTERS = ['all', 'remote', 'office', 'hybrid'] as const
export type WorkFormatFilter = WorkFormat | 'all'

export type ApplicationFilters = {
  query: string
  format: WorkFormatFilter
  sort: SortOrder
}

export const DEFAULT_FILTERS: ApplicationFilters = {
  query: '',
  format: 'all',
  sort: 'newest',
}

// Назви query-параметрів в адресі: /app?q=react&format=remote&sort=oldest
export const FILTER_PARAMS = {
  query: 'q',
  format: 'format',
  sort: 'sort',
} as const satisfies Record<keyof ApplicationFilters, string>

// Адресу може змінити будь-хто — тому кожен параметр перевіряємо, а невідомі значення ігноруємо.
// .catch(значення): якщо параметр відсутній або некоректний — взяти значення за замовчуванням
const filtersSearchSchema = z.object({
  [FILTER_PARAMS.query]: z.string().catch(DEFAULT_FILTERS.query),
  [FILTER_PARAMS.format]: z.enum(WORK_FORMAT_FILTERS).catch(DEFAULT_FILTERS.format),
  [FILTER_PARAMS.sort]: z.enum(SORT_ORDERS).catch(DEFAULT_FILTERS.sort),
})

export function parseFilters(searchParams: URLSearchParams): ApplicationFilters {
  const params = filtersSearchSchema.parse(Object.fromEntries(searchParams))

  return {
    query: params[FILTER_PARAMS.query],
    format: params[FILTER_PARAMS.format],
    sort: params[FILTER_PARAMS.sort],
  }
}

export function hasActiveFilters(filters: ApplicationFilters) {
  return filters.query.trim() !== '' || filters.format !== DEFAULT_FILTERS.format
}

function normalize(text: string) {
  return text.trim().toLocaleLowerCase('uk-UA')
}

const compareByCompany = new Intl.Collator('uk-UA', { sensitivity: 'base' }).compare

const comparators: Record<SortOrder, (a: Application, b: Application) => number> = {
  // ISO-дати можна порівнювати як рядки: "2026-10-05..." > "2026-09-28..."
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  company: (a, b) => compareByCompany(a.company, b.company),
}

export function applyFilters(applications: Application[], filters: ApplicationFilters) {
  const query = normalize(filters.query)

  return applications
    .filter((application) => {
      if (filters.format !== 'all' && application.workFormat !== filters.format) return false
      if (query === '') return true
      return (
        normalize(application.company).includes(query) ||
        normalize(application.position).includes(query)
      )
    })
    .toSorted(comparators[filters.sort])
}
