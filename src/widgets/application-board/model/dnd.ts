import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type Announcements,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from '@/entities/application'

// Що "несе" перетягуваний елемент. dnd-kit зберігає це в active.data.current.
// На дошці тягають два різні типи речей — поле type розрізняє їх (discriminated union)
export type DragData =
  | { type: 'card'; application: Application }
  | { type: 'column'; status: ApplicationStatus }

export function getDragData(data: unknown): DragData | null {
  if (typeof data === 'object' && data !== null && 'type' in data) {
    if (data.type === 'card' || data.type === 'column') return data as DragData
  }
  return null
}

// id колонки = її статус (і для сортування колонок, і як зона скидання карток). id приходить як string | number
export function toStatus(id: UniqueIdentifier | undefined): ApplicationStatus | null {
  return APPLICATION_STATUSES.find((status) => status === id) ?? null
}

export const collisionDetection: CollisionDetection = (args) => {
  // Колонку ставимо на місце тієї, до чийого центру вона найближча — так працює сортування
  if (getDragData(args.active.data.current)?.type === 'column') {
    return closestCenter(args)
  }
  // Картка: мишею/пальцем — колонка під курсором
  const underPointer = pointerWithin(args)
  if (underPointer.length > 0) return underPointer

  // Колонки мають висоту за вмістом, тож під короткою колонкою — порожнє місце.
  // Курсор там теж рахуємо: колонка, в чиїх межах по горизонталі він стоїть
  const { pointerCoordinates, droppableContainers, droppableRects } = args
  if (pointerCoordinates) {
    const column = droppableContainers.find((container) => {
      const rect = droppableRects.get(container.id)
      return rect && pointerCoordinates.x >= rect.left && pointerCoordinates.x <= rect.right
    })
    if (column) return [{ id: column.id }]
  }

  // З клавіатури курсора немає — за перетином прямокутників
  return rectIntersection(args)
}

// Клавіатура для картки: стрілка вліво/вправо переносить її одразу в сусідню колонку,
// а не на 25 пікселів, як за замовчуванням
const cardKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const { collisionRect, droppableRects, droppableContainers } = context
  const direction = event.code === 'ArrowRight' ? 1 : event.code === 'ArrowLeft' ? -1 : 0
  if (!collisionRect || direction === 0) return undefined

  event.preventDefault()
  const currentCenter = collisionRect.left + collisionRect.width / 2

  const columns = droppableContainers
    .getEnabled()
    .map((container) => droppableRects.get(container.id))
    .filter((rect) => rect !== undefined)
    .sort((a, b) => a.left - b.left)

  const target =
    direction === 1
      ? columns.find((rect) => rect.left + rect.width / 2 > currentCenter + 1)
      : columns.findLast((rect) => rect.left + rect.width / 2 < currentCenter - 1)

  if (!target) return undefined

  return {
    x: target.left + (target.width - collisionRect.width) / 2,
    y: target.top + 48,
  }
}

// Колонку з клавіатури сортує стандартний помічник з @dnd-kit/sortable, картку — наш
export const boardKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) =>
  getDragData(args.context.active?.data.current)?.type === 'column'
    ? sortableKeyboardCoordinates(event, args)
    : cardKeyboardCoordinates(event, args)

function nameOf(data: unknown) {
  const dragData = getDragData(data)
  if (dragData?.type === 'column') return `колонку «${STATUS_LABELS[dragData.status]}»`
  return `«${dragData?.application.company ?? 'вакансію'}»`
}

// Речення, що починається з назви: «колонку…» → «Колонку…»
function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function isColumn(data: unknown) {
  return getDragData(data)?.type === 'column'
}

function columnLabel(id: UniqueIdentifier | undefined) {
  const status = toStatus(id)
  return status ? STATUS_LABELS[status] : null
}

// Підказка для скрінрідера, прив'язана до кнопки перетягування через aria-describedby
export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Щоб перемістити, натисни пробіл. Стрілками вліво і вправо обери місце, ' +
    'пробіл — щоб покласти, Escape — щоб скасувати.',
}

// Що скрінрідер оголошує під час перетягування (dnd-kit сам створює для цього live-регіон)
export const announcements: Announcements = {
  onDragStart({ active }) {
    return `Узято ${nameOf(active.data.current)}.`
  },
  onDragOver({ active, over }) {
    const label = columnLabel(over?.id)
    if (!label) return `${capitalize(nameOf(active.data.current))} поза колонками.`
    return isColumn(active.data.current)
      ? `${capitalize(nameOf(active.data.current))} на місці «${label}».`
      : `${nameOf(active.data.current)} над етапом «${label}».`
  },
  onDragEnd({ active, over }) {
    const label = columnLabel(over?.id)
    if (!label) return `Переміщення скасовано: ${nameOf(active.data.current)}.`
    return isColumn(active.data.current)
      ? `${capitalize(nameOf(active.data.current))} переставлено на місце «${label}».`
      : `${nameOf(active.data.current)} переміщено в «${label}».`
  },
  onDragCancel({ active }) {
    return `Переміщення скасовано: ${nameOf(active.data.current)}.`
  },
}
