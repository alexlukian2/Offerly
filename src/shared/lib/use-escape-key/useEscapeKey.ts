import { useEffect, useEffectEvent } from 'react'

type UseEscapeKeyOptions = {
  enabled?: boolean
}

export function useEscapeKey(onEscape: () => void, { enabled = true }: UseEscapeKeyOptions = {}) {
  // Свіжий onEscape без перепідписки на кожен рендер (див. урок 10.10)
  const handleEscape = useEffectEvent(onEscape)

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      // defaultPrevented: Escape уже обробив хтось "вище" — наприклад, відкритий випадний список
      // закрив сам себе. Тоді модалку під ним не закриваємо
      if (event.key === 'Escape' && !event.defaultPrevented) {
        handleEscape()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
