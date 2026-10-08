import { arrayMove } from '@dnd-kit/sortable'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/entities/application'
import { useLocalStorage } from '@/shared/lib/storage'

const STORAGE_KEY = 'offerly:board:column-order'

// Збережений порядок приймаємо, лише якщо це ПЕРЕСТАНОВКА всіх етапів: кожен рівно один раз.
// Інакше (старий формат, ручна правка в DevTools, новий етап у майбутньому) — порядок за замовчуванням
export function isColumnOrder(value: unknown): value is ApplicationStatus[] {
  return (
    Array.isArray(value) &&
    value.length === APPLICATION_STATUSES.length &&
    APPLICATION_STATUSES.every((status) => value.includes(status))
  )
}

// Переносить колонку active на місце колонки over у ПОВНОМУ порядку (разом зі схованими)
export function reorderColumns(
  order: readonly ApplicationStatus[],
  active: ApplicationStatus,
  over: ApplicationStatus,
): ApplicationStatus[] {
  return arrayMove([...order], order.indexOf(active), order.indexOf(over))
}

export function useColumnOrder() {
  return useLocalStorage<ApplicationStatus[]>(STORAGE_KEY, [...APPLICATION_STATUSES], isColumnOrder)
}
