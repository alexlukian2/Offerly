import { useEffect } from 'react'
import { writeToStorage } from './storage'

// Тримає localStorage[key] у синхроні з поточним значенням
export function useSyncToStorage(key: string, value: unknown) {
  useEffect(() => {
    writeToStorage(key, value)
  }, [key, value])
}
