import { useLayoutEffect, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/shared/lib/storage'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import { isThemePreference, THEME_STORAGE_KEY, type ResolvedTheme } from './theme'
import { ThemeContext } from './themeContext'

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Вибір користувача: зберігається в браузері й синхронізується між вкладками
  const [preference, setPreference] = useLocalStorage(
    THEME_STORAGE_KEY,
    'system',
    isThemePreference,
  )
  // Тема операційної системи — "наживо": зміниться, щойно користувач перемкне її в ОС
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  // Похідне значення: не зберігаємо, а обчислюємо з двох джерел
  const resolvedTheme: ResolvedTheme =
    preference === 'system' ? (systemPrefersDark ? 'dark' : 'light') : preference

  // useLayoutEffect, а не useEffect: атрибут має змінитися ДО того, як браузер намалює кадр,
  // інакше при перемиканні на мить було б видно стару тему
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
