import { z } from 'zod'
import {
  applicationStatusSchema,
  workFormatSchema,
  type Application,
} from '../model/types'

// Рядок таблиці так, як його повертає база: snake_case і null замість "немає".
// Схема і ПЕРЕВІРЯЄ відповідь сервера, і ПЕРЕТВОРЮЄ її у формат застосунку (.transform)
export const applicationRowSchema = z
  .object({
    id: z.string(),
    company: z.string(),
    position: z.string(),
    status: applicationStatusSchema,
    work_format: workFormatSchema,
    salary: z.string().nullable(),
    url: z.string().nullable(),
    created_at: z.iso.datetime({ offset: true }), // "2026-10-01T09:00:00+00:00"
  })
  .transform(
    (row): Application => ({
      id: row.id,
      company: row.company,
      position: row.position,
      status: row.status,
      workFormat: row.work_format,
      salary: row.salary ?? undefined,
      url: row.url ?? undefined,
      createdAt: new Date(row.created_at).toISOString(), // єдиний формат дат (урок 22.5)
    }),
  )

// Дані для створення/оновлення: без id і дати — їх генерує база
export type ApplicationInput = Omit<Application, 'id' | 'createdAt'>

// Колонки, які просимо в бази. Явний список замість '*': не тягнемо зайвого і бачимо, на що покладаємось
export const APPLICATION_COLUMNS = 'id, company, position, status, work_format, salary, url, created_at'

// Застосунок → база: camelCase → snake_case, undefined → null (інакше поле не очиститься)
export function toApplicationRow(input: ApplicationInput) {
  return {
    company: input.company,
    position: input.position,
    status: input.status,
    work_format: input.workFormat,
    salary: input.salary ?? null,
    url: input.url ?? null,
  }
}
