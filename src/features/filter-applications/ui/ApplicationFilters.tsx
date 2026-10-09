import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useId, useState, type ChangeEvent } from 'react'
import { WORK_FORMAT_LABELS, type WorkFormat } from '@/entities/application'
import { useDebouncedCallback } from '@/shared/lib/use-debounced-callback'
import { Button } from '@/shared/ui/button'
import { SearchInput } from '@/shared/ui/search-input'
import { Select, type SelectOption } from '@/shared/ui/select'
import { cn } from '@/shared/lib/cn'
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  SORT_LABELS,
  SORT_ORDERS,
  type SortOrder,
  type WorkFormatFilter,
} from '../model/filters'
import { useApplicationFilters } from '../model/useApplicationFilters'
import styles from './ApplicationFilters.module.css'

const FORMAT_OPTIONS: SelectOption<WorkFormatFilter>[] = [
  { value: 'all', label: 'Усі формати' },
  ...(Object.keys(WORK_FORMAT_LABELS) as WorkFormat[]).map((format) => ({
    value: format,
    label: WORK_FORMAT_LABELS[format],
  })),
]

const SORT_OPTIONS: SelectOption<SortOrder>[] = SORT_ORDERS.map((order) => ({
  value: order,
  label: SORT_LABELS[order],
}))
const SEARCH_DELAY_MS = 300

type ApplicationFiltersProps = {
  resultCount: number
  totalCount: number
}

export function ApplicationFilters({ resultCount, totalCount }: ApplicationFiltersProps) {
  const id = useId()
  const { filters, setFilter, resetFilters } = useApplicationFilters()

  // Текст у полі пошуку оновлюється миттєво, а в адресу потрапляє із затримкою
  const [searchText, setSearchText] = useState(filters.query)

  // Якщо пошук в адресі змінився НЕ через введення (кнопка "Назад", "Скинути"),
  // підтягуємо поле до адреси. Це оновлення state під час рендеру — див. пояснення в уроці.
  const [syncedQuery, setSyncedQuery] = useState(filters.query)
  if (filters.query !== syncedQuery) {
    setSyncedQuery(filters.query)
    setSearchText(filters.query)
  }

  const updateQueryInUrl = useDebouncedCallback((value: string) => {
    setFilter('query', value, { replace: true })
  }, SEARCH_DELAY_MS)

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value)
    updateQueryInUrl(event.target.value)
  }

  function handleSearchClear() {
    setSearchText('')
    updateQueryInUrl('')
  }

  const isFiltered = hasActiveFilters(filters)

  // На телефоні формат і сортування сховані за кнопкою "Фільтри" — лишається лише пошук.
  // Число на кнопці — скільки з них змінено, щоб було видно: щось відфільтровано, навіть коли панель закрита
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const changedCount =
    Number(filters.format !== DEFAULT_FILTERS.format) +
    Number(filters.sort !== DEFAULT_FILTERS.sort)

  return (
    <div className={styles.bar}>
      <div className={styles.controls}>
        <SearchInput
          className={styles.search}
          value={searchText}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Пошук за компанією або позицією"
          aria-label="Пошук вакансій"
        />

        <button
          type="button"
          className={cn(styles.toggle, (isPanelOpen || changedCount > 0) && styles.toggleActive)}
          aria-expanded={isPanelOpen}
          aria-controls={`${id}-panel`}
          aria-label={changedCount > 0 ? `Фільтри, змінено: ${changedCount}` : 'Фільтри'}
          onClick={() => setIsPanelOpen((open) => !open)}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          {changedCount > 0 && <span className={styles.badge}>{changedCount}</span>}
        </button>

        {/* Панель: на телефоні — відкривається кнопкою, з 640px — завжди видима (CSS) */}
        <div id={`${id}-panel`} className={cn(styles.panel, isPanelOpen && styles.panelOpen)}>
          <label className="visually-hidden" htmlFor={`${id}-format`}>
            Формат роботи
          </label>
          <Select
            id={`${id}-format`}
            className={styles.select}
            value={filters.format}
            onValueChange={(format) => setFilter('format', format)}
            options={FORMAT_OPTIONS}
          />

          <label className="visually-hidden" htmlFor={`${id}-sort`}>
            Сортування
          </label>
          <Select
            id={`${id}-sort`}
            className={styles.select}
            value={filters.sort}
            onValueChange={(sort) => setFilter('sort', sort)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* Live-регіон існує завжди: скрінрідери оголошують лише зміни в ПРИСУТНЬОМУ регіоні */}
      <p className="visually-hidden" aria-live="polite">
        {isFiltered ? `Знайдено ${resultCount} з ${totalCount}` : ''}
      </p>

      {isFiltered && (
        <div className={styles.summary}>
          <p aria-hidden="true">
            Знайдено <strong>{resultCount}</strong> з {totalCount}
          </p>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw size={14} />
            Скинути фільтри
          </Button>
        </div>
      )}
    </div>
  )
}
