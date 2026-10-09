import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { ensureSession, parseResponse, supabase, toDatabaseError } from '@/shared/api'
import { applicationRowSchema } from './applicationRow'

// Посилання "Поділитися" (таблиця shares, міграція 20261009150000_shares.sql).
// applicationId = null → посилання на всю дошку

const SHARES = 'shares'

// Існуюче посилання власника (або null, якщо ще не створене / вимкнене)
export async function fetchShareId(applicationId: string | null): Promise<string | null> {
  await ensureSession()
  const query = supabase.from(SHARES).select('id')
  // .is для null, .eq для значення: у SQL "= null" ніколи не буває істиною
  const { data, error } = await (
    applicationId === null
      ? query.is('application_id', null)
      : query.eq('application_id', applicationId)
  ).maybeSingle()

  if (error) throw toDatabaseError(error)
  return data?.id ?? null
}

export async function createShare(applicationId: string | null): Promise<string> {
  await ensureSession()
  const { data, error } = await supabase
    .from(SHARES)
    .insert({ application_id: applicationId }) // user_id підставить база (default auth.uid())
    .select('id')
    .single()

  if (error) throw toDatabaseError(error)
  return data.id
}

// Вимкнути посилання = видалити рядок. Стара адреса одразу перестане працювати
export async function deleteShare(shareId: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from(SHARES).delete().eq('id', shareId)
  if (error) throw toDatabaseError(error)
}

const sharedContentSchema = z.object({
  kind: z.enum(['board', 'application']),
  applications: applicationRowSchema.array(),
})

export type SharedContent = z.infer<typeof sharedContentSchema>

// Що бачить гість за посиланням. БЕЗ ensureSession: гостю не потрібен акаунт —
// функцію get_share бази дозволено викликати навіть без входу. null — посилання недійсне
export async function fetchSharedContent(shareId: string): Promise<SharedContent | null> {
  const { data, error } = await supabase.rpc('get_share', { share_id: shareId })
  if (error) {
    // 22P02 — рядок в адресі не схожий на uuid: це просто неправильне посилання, а не збій
    if (error.code === '22P02') return null
    throw toDatabaseError(error)
  }
  if (data === null) return null

  return parseResponse(sharedContentSchema, data)
}

export const shareKeys = {
  // Посилання власника на дошку ('board') або на конкретну вакансію
  owner: (applicationId: string | null) => ['shares', 'owner', applicationId ?? 'board'] as const,
  // Вміст за посиланням (сторінка гостя)
  content: (shareId: string) => ['shares', 'content', shareId] as const,
}

export function shareIdQueryOptions(applicationId: string | null) {
  return queryOptions({
    queryKey: shareKeys.owner(applicationId),
    queryFn: () => fetchShareId(applicationId),
  })
}

export function sharedContentQueryOptions(shareId: string) {
  return queryOptions({
    queryKey: shareKeys.content(shareId),
    queryFn: () => fetchSharedContent(shareId),
  })
}
