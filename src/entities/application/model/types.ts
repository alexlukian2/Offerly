import { z } from 'zod'

// Порядок статусів = порядок колонок на дошці
export const APPLICATION_STATUSES = [
  'wishlist',
  'applied',
  'test',
  'interview',
  'offer',
  'rejected',
] as const

export const WORK_FORMATS = ['remote', 'office', 'hybrid'] as const

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES)
export const workFormatSchema = z.enum(WORK_FORMATS)

export const applicationSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  status: applicationStatusSchema,
  workFormat: workFormatSchema,
  salary: z.string().optional(),
  url: z.string().optional(),
  createdAt: z.string(), // дата у форматі ISO: "2026-10-07T12:00:00.000Z"
  statusChangedAt: z.string().optional(), // коли востаннє змінився етап (ставить база, тригер)
  remindAt: z.string().optional(), // коли нагадати (ISO); немає — нагадування не стоїть
  remindNote: z.string().optional(), // що зробити: "Написати рекрутеру"
})

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>
export type WorkFormat = z.infer<typeof workFormatSchema>
export type Application = z.infer<typeof applicationSchema>
