import { ensureSession, parseResponse, supabase, toDatabaseError } from '@/shared/api'
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

  if (error) throw toDatabaseError(error)
  return parseResponse(applicationRowSchema.array(), data)
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
  if (error) throw toDatabaseError(error)
  return { ok: true, application: parseResponse(applicationRowSchema, data) }
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
  if (error) throw toDatabaseError(error)
  return { ok: true, application: parseResponse(applicationRowSchema, data) }
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

  if (error) throw toDatabaseError(error)
  return parseResponse(applicationRowSchema, data)
}

// Змінити лише нагадування: відкласти (новий час) або прибрати (null) — не чіпаючи інших полів
export async function updateApplicationReminder(
  id: string,
  remindAt: string | null,
): Promise<Application> {
  await ensureSession()
  const changes = remindAt ? { remind_at: remindAt } : { remind_at: null, remind_note: null }
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq('id', id)
    .select(APPLICATION_COLUMNS)
    .single()

  if (error) throw toDatabaseError(error)
  return parseResponse(applicationRowSchema, data)
}

// DELETE /rest/v1/applications?id=eq.<id>
export async function deleteApplication(id: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw toDatabaseError(error)
}
