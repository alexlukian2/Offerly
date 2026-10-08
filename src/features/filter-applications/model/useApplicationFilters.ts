import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { DEFAULT_FILTERS, FILTER_PARAMS, parseFilters, type ApplicationFilters } from './filters'

type UpdateOptions = {
  // true — замінити поточний запис історії (для пошуку, що змінюється на кожну літеру)
  replace?: boolean
}

export function useApplicationFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // searchParams змінюється лише тоді, коли змінилась адреса —
  // тож і filters буде тим самим об'єктом між рендерами, поки адреса та сама
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])

  function setFilter<K extends keyof ApplicationFilters>(
    key: K,
    value: ApplicationFilters[K],
    { replace = false }: UpdateOptions = {},
  ) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        // Значення за замовчуванням не пишемо в адресу — вона лишається короткою
        if (value === DEFAULT_FILTERS[key] || value === '') {
          next.delete(FILTER_PARAMS[key])
        } else {
          next.set(FILTER_PARAMS[key], value)
        }
        return next
      },
      { replace },
    )
  }

  function resetFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete(FILTER_PARAMS.query)
      next.delete(FILTER_PARAMS.format)
      // Сортування — не фільтр: "Скинути фільтри" його не чіпає
      return next
    })
  }

  return { filters, setFilter, resetFilters }
}
