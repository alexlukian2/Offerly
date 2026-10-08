import { useState } from 'react'
import { readFromStorage } from './storage'
import { useStorageChange } from './useStorageChange'
import { useSyncToStorage } from './useSyncToStorage'

// Як useState, але значення:
//  - читається з localStorage при першому рендері,
//  - зберігається туди при кожній зміні,
//  - оновлюється, якщо його змінили в іншій вкладці.
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  isValid: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = readFromStorage(key)
    return isValid(stored) ? stored : defaultValue
  })

  useSyncToStorage(key, value)

  useStorageChange(key, (newValue) => {
    setValue(isValid(newValue) ? newValue : defaultValue)
  })

  return [value, setValue] as const
}
