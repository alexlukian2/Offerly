import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '../model/types'

export function countByStatus(applications: Application[]): Record<ApplicationStatus, number> {
  // Стартуємо з нулів для КОЖНОГО статусу, щоб порожні етапи теж були в результаті
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, 0])) as Record<
    ApplicationStatus,
    number
  >

  for (const application of applications) {
    counts[application.status] += 1
  }

  return counts
}
