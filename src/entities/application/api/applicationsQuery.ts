import { queryOptions } from '@tanstack/react-query'
import { fetchApplications } from './applicationsApi'

export const applicationKeys = {
  all: ['applications'] as const,
}

export const applicationsQueryOptions = queryOptions({
  queryKey: applicationKeys.all,
  queryFn: fetchApplications,
})
