// Вибір користувача — три варіанти; фактична тема на екрані — лише дві.
// 'system' в інтерфейсі не показуємо: це стан "користувач ще нічого не обирав" —
// тема йде за ОС. Щойно він натисне перемикач, вибір стає явним: 'light' або 'dark'
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]
export type ResolvedTheme = 'light' | 'dark'

// Ключ і формат мусять збігатися зі скриптом в index.html
export const THEME_STORAGE_KEY = 'offerly:theme'

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference)
}
