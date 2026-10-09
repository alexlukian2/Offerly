import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ApplicationCard,
  type Application,
  type ApplicationStatus,
} from '@/entities/application'
import { NoteSheet, notesQueryOptions, type Note } from '@/entities/note'
import { NoteEditorModal, useNoteMutations } from '@/features/manage-note'
import { useMoveApplication } from '@/features/move-application'
import { reorderColumns, useColumnOrder } from '../model/columnOrder'
import {
  announcements,
  boardKeyboardCoordinates,
  collisionDetection,
  getDragData,
  screenReaderInstructions,
  toStatus,
  type DragData,
} from '../model/dnd'
import { BoardColumn, BoardColumnPreview } from './BoardColumn'
import { StageTabs } from './StageTabs'
import styles from './ApplicationBoard.module.css'

type ApplicationBoardProps = {
  applications: Application[]
  // Етапи, колонки яких не показувати (наприклад, "Відмова")
  hiddenStatuses?: readonly ApplicationStatus[]
}

export function ApplicationBoard({ applications, hiddenStatuses = [] }: ApplicationBoardProps) {
  const { move } = useMoveApplication()
  // Порядок колонок — налаштування вигляду, а не дані вакансій: живе в localStorage, не в базі
  const [columnOrder, setColumnOrder] = useColumnOrder()
  // Що зараз тягнуть — для DragOverlay. null — нічого
  const [dragged, setDragged] = useState<DragData | null>(null)
  // Нотатки — звичайним (не Suspense) запитом: дошка з вакансіями не чекає на них
  const { data: notes = [] } = useQuery(notesQueryOptions)
  const { update: updateNote } = useNoteMutations()
  const [openedNote, setOpenedNote] = useState<Note | null>(null)

  const visibleStatuses = columnOrder.filter((status) => !hiddenStatuses.includes(status))
  const boardRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    // Миша: перетягування починається після зсуву на 8px — звичайний клік лишається кліком
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Палець: натиснути й потримати 250мс — інакше звичайний свайп прокручує дошку
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    // Клавіатура: пробіл — взяти/покласти, стрілки — сусіднє місце, Escape — скасувати
    useSensor(KeyboardSensor, { coordinateGetter: boardKeyboardCoordinates }),
  )

  function applicationsOf(status: ApplicationStatus) {
    return applications.filter((application) => application.status === status)
  }

  function notesOf(status: ApplicationStatus) {
    return notes.filter((note) => note.status === status)
  }

  // Скільки нотаток у кожної вакансії — для позначки на картці
  const noteCounts: Record<string, number> = {}
  for (const note of notes) {
    if (note.applicationId) noteCounts[note.applicationId] = (noteCounts[note.applicationId] ?? 0) + 1
  }

  const counts = Object.fromEntries(
    columnOrder.map((status) => [status, applicationsOf(status).length]),
  ) as Record<ApplicationStatus, number>

  function handleDragStart({ active }: DragStartEvent) {
    setDragged(getDragData(active.data.current))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDragged(null)

    const data = getDragData(active.data.current)
    const overStatus = toStatus(over?.id)
    if (!data || !overStatus) return

    if (data.type === 'column') {
      if (data.status !== overStatus) {
        setColumnOrder((order) => reorderColumns(order, data.status, overStatus))
      }
      return
    }

    if (data.type === 'note') {
      if (data.note.status !== overStatus) {
        updateNote.mutate({ id: data.note.id, changes: { status: overStatus } })
      }
      return
    }

    if (data.application.status !== overStatus) {
      move(data.application, overStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragged(null)}
    >
      {/* SortableContext знає порядок колонок і рахує, куди зсунути сусідів під час перестановки.
          Картки в items не входять — тож коли тягнуть картку, колонки стоять на місці */}
      <StageTabs statuses={visibleStatuses} counts={counts} boardRef={boardRef} />

      <SortableContext items={visibleStatuses} strategy={horizontalListSortingStrategy}>
        <div ref={boardRef} className={styles.board}>
          {visibleStatuses.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              applications={applicationsOf(status)}
              notes={notesOf(status)}
              noteCounts={noteCounts}
              onOpenNote={setOpenedNote}
            />
          ))}
        </div>
      </SortableContext>

      {/* Копія того, що тягнуть, їде за курсором. Через портал у body — щоб її не обрізав
          горизонтальний скрол дошки (overflow) */}
      {createPortal(
        <DragOverlay>
          {dragged?.type === 'card' && (
            <div className={styles.overlay}>
              <ApplicationCard application={dragged.application} />
            </div>
          )}
          {dragged?.type === 'note' && (
            <div className={styles.noteOverlay}>
              <NoteSheet note={dragged.note} clamp />
            </div>
          )}
          {dragged?.type === 'column' && (
            <div className={styles.columnOverlay}>
              <BoardColumnPreview
                status={dragged.status}
                applications={applicationsOf(dragged.status)}
              />
            </div>
          )}
        </DragOverlay>,
        document.body,
      )}

      {openedNote && <NoteEditorModal note={openedNote} onClose={() => setOpenedNote(null)} />}
    </DndContext>
  )
}
