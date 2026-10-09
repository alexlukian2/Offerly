import { Moon, Sun } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useTheme } from '../model/useTheme'
import styles from './ThemeSwitcher.module.css'

type ThemeSwitcherProps = {
  className?: string
  // 'icon' — кругла кнопка-іконка (шапка лендінгу); 'labeled' — звичайна кнопка з підписом (сайдбар)
  variant?: 'icon' | 'labeled'
}

// Одна кнопка-перемикач (toggle button): aria-pressed каже скрінрідеру "Темна тема, натиснуто / не натиснуто".
// Перемикаємо від ТЕМИ НА ЕКРАНІ (resolvedTheme), а не від вибору: якщо вибір 'system' і ОС темна,
// натискання має увімкнути світлу
export function ThemeSwitcher({ className, variant = 'icon' }: ThemeSwitcherProps) {
  const { resolvedTheme, setPreference } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className={cn(styles.toggle, variant === 'labeled' && styles.labeled, className)}
      aria-pressed={isDark}
      title={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      onClick={() => setPreference(isDark ? 'light' : 'dark')}
    >
      <span className="visually-hidden">Темна тема</span>
      <span className={styles.icons}>
        {/* Обидві іконки завжди в DOM, одна над одною. Видима — та, що відповідає темі;
          друга схована поворотом і зменшенням. При перемиканні CSS-transition плавно міняє їх місцями */}
        <Sun size={18} aria-hidden="true" className={cn(styles.icon, styles.sun)} />
        <Moon size={18} aria-hidden="true" className={cn(styles.icon, styles.moon)} />
      </span>
      {/* Видимий підпис — що станеться при натисканні. Для скрінрідера назву вже дає "Темна тема" + aria-pressed */}
      {variant === 'labeled' && (
        <span className={styles.label} aria-hidden="true">
          {isDark ? 'Світла тема' : 'Темна тема'}
        </span>
      )}
    </button>
  )
}
