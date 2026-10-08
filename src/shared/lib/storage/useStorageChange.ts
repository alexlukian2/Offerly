import { useEffect, useEffectEvent } from 'react'

// Подія "storage" приходить, коли localStorage змінила ІНША вкладка того ж сайту.
// (Вкладка, яка сама записала значення, цієї події не отримує.)
export function useStorageChange(key: string, onChange: (value: unknown) => void) {
  const handleChange = useEffectEvent(onChange)

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== localStorage || event.key !== key) return

      try {
        handleChange(event.newValue === null ? null : JSON.parse(event.newValue))
      } catch {
        // Інша вкладка записала щось незрозуміле — ігноруємо
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])
}
