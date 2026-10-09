import { z } from 'zod'
import { fromLocalInputValue, toLocalInputValue } from './reminder'
import {
  applicationStatusSchema,
  workFormatSchema,
  type Application,
} from './types'

const requiredText = (message: string) => z.string().trim().min(1, { error: message })

// Порожній рядок у формі = "не вказано" → undefined у даних
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)

const httpUrl = z.url({ protocol: /^https?$/ })

// Нагадування: у полі — місцевий час "2026-10-10T10:00" або '' (не стоїть). На виході — ISO або undefined.
// Минулий час не приймаємо: нагадування про те, що вже було, нічого не дасть
const reminderTime = z
  .string()
  .refine((value) => value === '' || !Number.isNaN(new Date(value).getTime()), {
    error: 'Вкажи дату й час',
  })
  .refine((value) => value === '' || new Date(value).getTime() > Date.now(), {
    error: 'Цей час уже минув — обери майбутній',
  })
  .transform((value) => (value ? fromLocalInputValue(value) : undefined))

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
  remindAt: reminderTime,
  remindNote: z
    .string()
    .trim()
    .max(200, { error: 'Не довше 200 символів' }) // те саме обмеження стоїть у базі
    .transform((value) => value || undefined),
})
  // Нотатка без часу нагадування нічого не означає — відкидаємо її
  .transform((values) => (values.remindAt ? values : { ...values, remindNote: undefined }))

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
  remindAt: '',
  remindNote: '',
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
    remindAt: application.remindAt ? toLocalInputValue(application.remindAt) : '',
    remindNote: application.remindNote ?? '',
  }
}
