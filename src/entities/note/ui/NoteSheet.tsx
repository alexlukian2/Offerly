import { Pin } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatShortDate } from '@/shared/lib/format-date'
import type { Note } from '../model/types'
import styles from './NoteSheet.module.css'

type NoteSheetProps = {
  note: Note
  // На дошці текст обрізаємо до кількох рядків; на сторінці вакансії — повністю
  clamp?: boolean
  // Клік по листочку (відкрити редагування). Немає — листочок лише для читання
  onOpen?: () => void
  actions?: ReactNode
  className?: string
}

// Листочок у клітинку з текстом "від руки", приколотий шпилькою.
// Невеликий нахил залежить від id — у кожної нотатки свій, але стабільний між рендерами
export function NoteSheet({ note, clamp, onOpen, actions, className }: NoteSheetProps) {
  const tilt = (note.id.charCodeAt(0) % 5) - 2 // від -2 до 2 градусів

  const content = (
    <>
      <span className={styles.pin} aria-hidden="true">
        <Pin size={14} />
      </span>
      <p className={cn(styles.text, clamp && styles.clamp)}>{note.text}</p>
      <span className={styles.footer}>
        <time dateTime={note.updatedAt}>{formatShortDate(note.updatedAt)}</time>
        {actions}
      </span>
    </>
  )

  return (
    <article
      className={cn(styles.sheet, styles[note.color], className)}
      style={{ rotate: `${tilt * 0.6}deg` }}
      aria-label="Нотатка"
    >
      {onOpen ? (
        <button type="button" className={styles.open} onClick={onOpen} aria-label="Відкрити нотатку">
          {content}
        </button>
      ) : (
        content
      )}
    </article>
  )
}
