import { useSuspenseQuery } from '@tanstack/react-query'
import { applicationsQueryOptions } from '../api/applicationsQuery'

// Список вакансій з сервера. "Suspense"-варіант: поки дані вантажаться, компонент "призупиняється",
// і найближчий <Suspense> показує loader; помилку отримує найближча межа помилок (урок 18).
// Тому data тут ЗАВЖДИ є — компонентам не треба перевіряти "а чи завантажилось".
export function useApplications() {
  return useSuspenseQuery(applicationsQueryOptions).data
}
