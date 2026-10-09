import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/entities/application/@x/note'
import { ensureSession, parseResponse, supabase, toDatabaseError } from '@/shared/api'
import { NOTE_COLORS, type Note, type NoteColor } from '../model/types'

const TABLE = 'notes'
const COLUMNS = 'id, text, color, application_id, status, created_at, updated_at'

// Рядок бази → нотатка застосунку (snake_case → camelCase, null → undefined)
const noteRowSchema = z
  .object({
    id: z.string(),
    text: z.string(),
    color: z.enum(NOTE_COLORS),
    application_id: z.string().nullable(),
    status: z.enum(APPLICATION_STATUSES).nullable(),
    created_at: z.iso.datetime({ offset: true }),
    updated_at: z.iso.datetime({ offset: true }),
  })
  .transform(
    (row): Note => ({
      id: row.id,
      text: row.text,
      color: row.color,
      applicationId: row.application_id ?? undefined,
      status: row.status ?? undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }),
  )

export async function fetchNotes(): Promise<Note[]> {
  await ensureSession()
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw toDatabaseError(error)
  return parseResponse(noteRowSchema.array(), data)
}

export type CreateNoteInput = {
  text: string
  color: NoteColor
  // Рівно одне з двох — так само перевіряє і база (constraint notes_one_place)
  place: { applicationId: string } | { status: ApplicationStatus }
}

export async function createNote({ text, color, place }: CreateNoteInput): Promise<Note> {
  await ensureSession()
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      text,
      color,
      application_id: 'applicationId' in place ? place.applicationId : null,
      status: 'status' in place ? place.status : null,
    })
    .select(COLUMNS)
    .single()
  if (error) throw toDatabaseError(error)
  return parseResponse(noteRowSchema, data)
}

export type UpdateNoteInput = Partial<Pick<Note, 'text' | 'color' | 'status'>>

export async function updateNote(id: string, changes: UpdateNoteInput): Promise<Note> {
  await ensureSession()
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw toDatabaseError(error)
  return parseResponse(noteRowSchema, data)
}

export async function deleteNote(id: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw toDatabaseError(error)
}

export const noteKeys = {
  all: ['notes'] as const,
}

export const notesQueryOptions = queryOptions({
  queryKey: noteKeys.all,
  queryFn: fetchNotes,
})
