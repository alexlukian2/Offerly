import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripHorizontal } from 'lucide-react'
import {
  ApplicationCard,
  STATUS_COLORS,
  STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from '@/entities/application'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/ui/icon-button'
import { getDragData, type DragData } from '../model/dnd'
import { BoardCard } from './BoardCard'
import styles from './BoardColumn.module.css'

type BoardColumnProps = {
  status: ApplicationStatus
  applications: Application[]
}

export function BoardColumn({ status, applications }: BoardColumnProps) {
  const titleId = `column-${status}`
  const data: DragData = { type: 'column', status }

  // useSortable = useDraggable + useDroppable в одному. Тож колонка одночасно:
  //  - елемент, який можна переставити (тягнемо за ручку в шапці),
  //  - зона скидання для карток (її id = статус, який отримає картка).
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({ id: status, data })

  // Підсвічуємо колонку, лише коли над нею КАРТКА. Під час перестановки колонок isOver теж true,
  // але там підсвітка не має сенсу
  const isCardOver = isOver && getDragData(active?.data.current)?.type === 'card'

  return (
    <section
      ref={setNodeRef}
      className={cn(styles.column, isCardOver && styles.over, isDragging && styles.dragging)}
      // Сусідні колонки "роз'їжджаються", звільняючи місце: transform рахує dnd-kit, ми лише застосовуємо.
      // Translate, а не Transform: колонки різної висоти, і scale її б розтягнув
      style={{ transform: CSS.Translate.toString(transform), transition }}
      aria-labelledby={titleId}
    >
      <header className={styles.header}>
        <span className={styles.dot} style={{ backgroundColor: STATUS_COLORS[status] }} />
        <h2 id={titleId} className={styles.title}>
          {STATUS_LABELS[status]}
        </h2>
        <span className={styles.count}>{applications.length}</span>
        {/* Колонку тягнемо ЛИШЕ за ручку: інакше будь-яке натискання в колонці (і на картці теж)
            починало б перестановку колонок */}
        <IconButton
          ref={setActivatorNodeRef}
          label={`Перемістити колонку «${STATUS_LABELS[status]}»`}
          className={styles.handle}
          {...attributes}
          {...listeners}
        >
          <GripHorizontal size={16} />
        </IconButton>
      </header>

      {applications.length === 0 ? (
        <p className={styles.empty}>{isCardOver ? 'Відпусти тут' : 'Поки порожньо'}</p>
      ) : (
        <ul className={styles.list}>
          {applications.map((application) => (
            <li key={application.id}>
              <BoardCard application={application} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

type BoardColumnPreviewProps = {
  status: ApplicationStatus
  applications: Application[]
}

// Копія колонки, яка їде за курсором (DragOverlay). Без хуків dnd-kit і без кнопок —
// лише картинка: справжня колонка в цей час лишається на дошці
export function BoardColumnPreview({ status, applications }: BoardColumnPreviewProps) {
  return (
    <div className={cn(styles.column, styles.preview)} aria-hidden="true">
      <div className={styles.header}>
        <span className={styles.dot} style={{ backgroundColor: STATUS_COLORS[status] }} />
        <span className={styles.title}>{STATUS_LABELS[status]}</span>
        <span className={styles.count}>{applications.length}</span>
      </div>
      <div className={styles.list}>
        {applications.slice(0, 4).map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>
    </div>
  )
}
