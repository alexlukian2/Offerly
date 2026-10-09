import type { PostgrestError } from '@supabase/supabase-js'
import { z } from 'zod'
import { ensureSession, supabase } from '@/shared/api'
import { NetworkError } from '@/shared/lib/errors'
import type { ApplicationFormErrors } from '../model/applicationForm'
import type { Application, ApplicationStatus } from '../model/types'
import {
  APPLICATION_COLUMNS,
  applicationRowSchema,
  toApplicationRow,
  type ApplicationInput,
} from './applicationRow'

const TABLE = 'applications'

// Код помилки PostgreSQL "unique_violation" — спрацював унікальний індекс компанія + позиція
const UNIQUE_VIOLATION = '23505'

export type SaveResult = { ok: true; application: Application } | { ok: false; errors: ApplicationFormErrors }

// Помилка бібліотеки → наша помилка. Мережеві збої (немає інтернету, сервер недоступний)
// перетворюємо на NetworkError, щоб інтерфейс показав зрозуміле повідомлення (урок 18)
function toError(error: PostgrestError): Error {
  if (!navigator.onLine || /fetch|network/i.test(error.message)) {
    return new NetworkError()
  }
  return new Error(`Помилка бази даних: ${error.message}`)
}

// safeParse не кидає, а повертає { success, data | error }. Помилку zod кладемо в cause:
// користувач побачить зрозуміле повідомлення, а розробник у консолі — що саме не так з даними
function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error('Сервер повернув дані в неочікуваному форматі', { cause: result.error })
  }
  return result.data
}

const duplicateErrors: ApplicationFormErrors = {
  position: 'Ця позиція в цій компанії вже є на дошці',
}

// GET /rest/v1/applications?select=...&order=created_at.desc
export async function fetchApplications(): Promise<Application[]> {
  await ensureSession() // RLS пускає лише користувача з сесією
  const { data, error } = await supabase
    .from(TABLE)
    .select(APPLICATION_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw toError(error)
  return parseOrThrow(applicationRowSchema.array(), data)
}

// POST /rest/v1/applications — база сама генерує id і created_at і повертає створений рядок
export async function createApplication(input: ApplicationInput): Promise<SaveResult> {
  await ensureSession()
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toApplicationRow(input))
    .select(APPLICATION_COLUMNS)
    .single()

  if (error?.code === UNIQUE_VIOLATION) return { ok: false, errors: duplicateErrors }
  if (error) throw toError(error)
  return { ok: true, application: parseOrThrow(applicationRowSchema, data) }
}

// PATCH /rest/v1/applications?id=eq.<id>
export async function updateApplication(id: string, input: ApplicationInput): Promise<SaveResult> {
  await ensureSession()
  const { data, error } = await supabase
    .from(TABLE)
    .update(toApplicationRow(input))
    .eq('id', id)
    .select(APPLICATION_COLUMNS)
    .single()

  if (error?.code === UNIQUE_VIOLATION) return { ok: false, errors: duplicateErrors }
  if (error) throw toError(error)
  return { ok: true, application: parseOrThrow(applicationRowSchema, data) }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<Application> {
  await ensureSession()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status })
    .eq('id', id)
    .select(APPLICATION_COLUMNS)
    .single()

  if (error) throw toError(error)
  return parseOrThrow(applicationRowSchema, data)
}

// DELETE /rest/v1/applications?id=eq.<id>
export async function deleteApplication(id: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw toError(error)
}
