import type { Application, ApplicationStatus } from '@/entities/application'

export const STALE_AFTER_DAYS = 14

// Етапи, де ти чекаєш відповіді. На "Хочу відгукнутись", "Офер" і "Відмова" чекати нічого
const WAITING_STATUSES: ApplicationStatus[] = ['applied', 'test', 'interview']

export type StaleApplication = { application: Application; days: number }

// Вакансії, що стоять на етапі очікування понад 14 днів — від найдавнішої.
// Дата зміни етапу — з бази (тригер); якщо її ще немає — дата створення
export function findStale(applications: Application[], now: Date): StaleApplication[] {
  return applications
    .filter((application) => WAITING_STATUSES.includes(application.status))
    .map((application) => {
      const since = new Date(application.statusChangedAt ?? application.createdAt)
      return { application, days: Math.floor((now.getTime() - since.getTime()) / 86_400_000) }
    })
    .filter(({ days }) => days >= STALE_AFTER_DAYS)
    .sort((a, b) => b.days - a.days)
}
