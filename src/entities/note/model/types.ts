import { z } from 'zod'
import { APPLICATION_STATUSES } from '@/entities/application/@x/note'

export const NOTE_COLORS = ['paper', 'yellow', 'pink', 'mint'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

export const NOTE_COLOR_LABELS: Record<NoteColor, string> = {
  paper: 'Білий',
  yellow: 'Жовтий',
  pink: 'Рожевий',
  mint: 'М’ятний',
}

export const NOTE_MAX_LENGTH = 2000

// Нотатка висить у ОДНОМУ місці: або на вакансії (applicationId), або в колонці дошки (status)
export const noteSchema = z.object({
  id: z.string(),
  text: z.string(),
  color: z.enum(NOTE_COLORS),
  applicationId: z.string().optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Note = z.infer<typeof noteSchema>
