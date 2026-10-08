import { useCallback, useSyncExternalStore } from 'react'

// Чи відповідає зараз екран/система медіа-запиту, наприклад '(prefers-color-scheme: dark)'.
// matchMedia — "зовнішнє сховище": воно змінюється поза React (користувач перемкнув тему в ОС).
// useSyncExternalStore — офіційний спосіб підписати React на таке сховище.
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', onChange)
      return () => mediaQueryList.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches, // поточне значення (snapshot)
    () => false, // значення під час рендеру на сервері (Next.js) — там matchMedia немає
  )
}
