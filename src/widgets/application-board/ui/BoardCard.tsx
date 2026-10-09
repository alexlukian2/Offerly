import {
  useDraggable,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core'
import { GripVertical, NotebookPen } from 'lucide-react'
import { memo } from 'react'
import { ApplicationCard, type Application } from '@/entities/application'
import { MoveApplicationButtons } from '@/features/move-application'
import { getApplicationPath } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { plural, WORDS } from '@/shared/lib/plural'
import { IconButton } from '@/shared/ui/icon-button'
import type { DragData } from '../model/dnd'
import styles from './BoardCard.module.css'

type BoardCardProps = {
  application: Application
  noteCount?: number // скільки нотаток прикріплено до вакансії
}

// Тонка обгортка: лише підключення до dnd-kit.
// useDraggable читає внутрішній контекст dnd-kit, який змінюється під час перетягування, —
// тож ця обгортка перерендерюється часто, і memo її від цього не захищає (memo не блокує Context)
export const BoardCard = memo(function BoardCard({ application, noteCount = 0 }: BoardCardProps) {
  const data: DragData = { type: 'card', application }
  const { setNodeRef, setActivatorNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: application.id,
    data,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(styles.draggable, isDragging && styles.dragging)}
      // Мишею та пальцем тягнемо за будь-яке місце картки. Клавіатурну активацію (onKeyDown)
      // сюди НЕ передаємо: інакше Enter на посиланні почав би перетягування замість переходу
      onMouseDown={(event) => listeners?.onMouseDown?.(event)}
      onTouchStart={(event) => listeners?.onTouchStart?.(event)}
    >
      <BoardCardContent
        application={application}
        noteCount={noteCount}
        attributes={attributes}
        listeners={listeners}
        setActivatorNodeRef={setActivatorNodeRef}
      />
    </div>
  )
})

type BoardCardContentProps = {
  application: Application
  noteCount: number
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
  setActivatorNodeRef: (element: HTMLElement | null) => void
}

// Важка частина — під окремим memo. Усі її props стабільні: dnd-kit мемоізує attributes,
// listeners і setActivatorNodeRef, а application — той самий об'єкт, поки вакансія не змінилась.
// Тож під час перетягування рендериться лише обгортка вище, а цей вміст — ні.
const BoardCardContent = memo(function BoardCardContent({
  application,
  noteCount,
  attributes,
  listeners,
  setActivatorNodeRef,
}: BoardCardContentProps) {
  return (
    <ApplicationCard
      application={application}
      extra={
        noteCount > 0 && (
          <span className={styles.notes}>
            <NotebookPen size={12} aria-hidden="true" />
            {plural(noteCount, WORDS.note)}
          </span>
        )
      }
      href={getApplicationPath(application.id)}
      actions={
        <>
          {/* Окрема кнопка-"ручка" для клавіатури і скрінрідера */}
          <IconButton
            ref={setActivatorNodeRef}
            label={`Перетягнути «${application.company}»`}
            className={styles.handle}
            {...attributes}
            onKeyDown={(event) => listeners?.onKeyDown?.(event)}
          >
            <GripVertical size={16} />
          </IconButton>
          <MoveApplicationButtons application={application} />
        </>
      }
    />
  )
})
