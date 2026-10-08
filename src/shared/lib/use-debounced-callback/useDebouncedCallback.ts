import { useEffect, useRef } from 'react'

// Повертає функцію, яка викликає callback лише через `delay` мс після ОСТАННЬОГО виклику.
// Кожен новий виклик скасовує попередній запланований.
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Патерн «останнього значення» (урок 12.9): таймер спрацює пізніше,
  // і має викликати найсвіжішу версію callback, а не ту, що була при старті таймера
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  // Компонент зник — скасовуємо запланований виклик
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    }
  }, [])

  return function debounced(...args: Args) {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      callbackRef.current(...args)
    }, delay)
  }
}
