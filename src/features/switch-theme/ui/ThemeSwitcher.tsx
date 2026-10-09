import { Moon, Sun } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useTheme } from '../model/useTheme'
import styles from './ThemeSwitcher.module.css'

type ThemeSwitcherProps = {
  className?: string
}

// Одна кнопка-перемикач (toggle button): aria-pressed каже скрінрідеру "Темна тема, натиснуто / не натиснуто".
// Перемикаємо від ТЕМИ НА ЕКРАНІ (resolvedTheme), а не від вибору: якщо вибір 'system' і ОС темна,
// натискання має увімкнути світлу
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { resolvedTheme, setPreference } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      aria-pressed={isDark}
      title={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      onClick={() => setPreference(isDark ? 'light' : 'dark')}
    >
      <span className="visually-hidden">Темна тема</span>
      {/* Обидві іконки завжди в DOM, одна над одною. Видима — та, що відповідає темі;
          друга схована поворотом і зменшенням. При перемиканні CSS-transition плавно міняє їх місцями */}
      <Sun size={18} aria-hidden="true" className={cn(styles.icon, styles.sun)} />
      <Moon size={18} aria-hidden="true" className={cn(styles.icon, styles.moon)} />
    </button>
  )
}
