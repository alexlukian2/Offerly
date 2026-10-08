import type { Application, ApplicationStatus } from './types'

// Усі можливі зміни списку вакансій — в одному типі.
// Поле type розрізняє дії, решта полів — дані, потрібні саме цій дії.
export type ApplicationsAction =
  | { type: 'added'; application: Application }
  | { type: 'updated'; application: Application }
  | { type: 'moved'; id: string; status: ApplicationStatus }
  | { type: 'deleted'; id: string }
  | { type: 'replaced'; applications: Application[] }

export function applicationsReducer(
  applications: Application[],
  action: ApplicationsAction,
): Application[] {
  switch (action.type) {
    case 'added':
      return [action.application, ...applications]

    case 'updated':
      return applications.map((application) =>
        application.id === action.application.id ? action.application : application,
      )

    case 'moved':
      return applications.map((application) =>
        application.id === action.id ? { ...application, status: action.status } : application,
      )

    case 'deleted':
      return applications.filter((application) => application.id !== action.id)

    case 'replaced':
      return action.applications
  }
}
