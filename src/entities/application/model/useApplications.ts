import { useSuspenseQuery } from '@tanstack/react-query'
import { applicationsQueryOptions } from '../api/applicationsQuery'

// Suspense-варіант: завантаження показує найближчий <Suspense>, помилку — межа помилок.
// Тож компонент завжди отримує готові дані
export function useApplications() {
  return useSuspenseQuery(applicationsQueryOptions).data
}
