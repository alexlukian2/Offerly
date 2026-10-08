import { queryOptions } from '@tanstack/react-query'
import { fetchApplications } from './applicationsApi'

// Ключі кешу — в одному місці. Ключ — це "адреса" даних у кеші TanStack Query
export const applicationKeys = {
  all: ['applications'] as const,
}

// Усе, що потрібно знати про запит списку: ключ кешу + функція завантаження.
// queryOptions лише допомагає TypeScript вивести тип даних (Application[]) для всіх, хто його використовує
export const applicationsQueryOptions = queryOptions({
  queryKey: applicationKeys.all,
  queryFn: fetchApplications,
})
