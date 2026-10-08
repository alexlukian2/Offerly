import type { LucideIcon } from 'lucide-react'
import { Monitor, Moon, Sun } from 'lucide-react'

// Вибір користувача — три варіанти; фактична тема на екрані — лише дві
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]
export type ResolvedTheme = 'light' | 'dark'

// Ключ і формат мусять збігатися зі скриптом в index.html (див. урок 20)
export const THEME_STORAGE_KEY = 'offerly:theme'

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference)
}

export const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Світла тема', icon: Sun },
  { value: 'dark', label: 'Темна тема', icon: Moon },
  { value: 'system', label: 'Як у системі', icon: Monitor },
]
