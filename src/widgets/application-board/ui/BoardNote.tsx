import { useDraggable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { NoteSheet, type Note } from '@/entities/note'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/ui/icon-button'
import type { DragData } from '../model/dnd'
import styles from './BoardCard.module.css'

type BoardNoteProps = {
  note: Note
  onOpen: (note: Note) => void
}

// Нотатка, приколота в колонці. Перетягується так само, як картка вакансії: мишею й пальцем —
// за будь-яке місце, з клавіатури — за ручку. id з префіксом: id нотатки й вакансії не мають збігатися
export function BoardNote({ note, onOpen }: BoardNoteProps) {
  const data: DragData = { type: 'note', note }
  const { setNodeRef, setActivatorNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `note:${note.id}`,
    data,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(styles.draggable, isDragging && styles.dragging)}
      onMouseDown={(event) => listeners?.onMouseDown?.(event)}
      onTouchStart={(event) => listeners?.onTouchStart?.(event)}
    >
      <NoteSheet
        note={note}
        clamp
        onOpen={() => onOpen(note)}
        actions={
          <IconButton
            ref={setActivatorNodeRef}
            label="Перетягнути нотатку"
            className={styles.handle}
            {...attributes}
            onKeyDown={(event) => listeners?.onKeyDown?.(event)}
          >
            <GripVertical size={14} />
          </IconButton>
        }
      />
    </div>
  )
}
