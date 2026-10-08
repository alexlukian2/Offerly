import { z } from 'zod'
import {
  applicationStatusSchema,
  workFormatSchema,
  type Application,
} from './types'

const requiredText = (message: string) => z.string().trim().min(1, { error: message })

// Порожній рядок у формі = "не вказано" → undefined у даних (урок 7.6)
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)

const httpUrl = z.url({ protocol: /^https?$/ })

// Схема форми. На ВХОДІ — те, що в полях (усе рядки), на ВИХОДІ — готові дані для збереження.
// Правила валідації й повідомлення — тут, в одному місці
export const applicationFormSchema = z.object({
  company: requiredText('Вкажи назву компанії'),
  position: requiredText('Вкажи позицію'),
  status: applicationStatusSchema,
  workFormat: workFormatSchema,
  salary: optionalText,
  url: z
    .string()
    .trim()
    .refine((value) => value === '' || httpUrl.safeParse(value).success, {
      error: 'Посилання має починатися з http:// або https://',
    })
    .transform((value) => value || undefined),
})

// Два типи з однієї схеми: що в полях форми і що вийде після перевірки
export type ApplicationFormValues = z.input<typeof applicationFormSchema>
export type ApplicationFormOutput = z.output<typeof applicationFormSchema>

export type ApplicationFormErrors = Partial<Record<keyof ApplicationFormValues, string>>

export const emptyFormValues: ApplicationFormValues = {
  company: '',
  position: '',
  status: 'applied',
  workFormat: 'remote',
  salary: '',
  url: '',
}

// Вакансія → значення форми (для редагування)
export function toFormValues(application: Application): ApplicationFormValues {
  return {
    company: application.company,
    position: application.position,
    status: application.status,
    workFormat: application.workFormat,
    salary: application.salary ?? '',
    url: application.url ?? '',
  }
}
