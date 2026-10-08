import { useId } from 'react'
import { cn } from '@/shared/lib/cn'
import { THEME_OPTIONS } from '../model/theme'
import { useTheme } from '../model/useTheme'
import styles from './ThemeSwitcher.module.css'

type ThemeSwitcherProps = {
  className?: string
}

// Три взаємовиключні варіанти — це семантично група радіокнопок.
// Нативні <input type="radio"> дають усе безкоштовно: стрілки для вибору, оголошення "1 з 3" тощо
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { preference, setPreference } = useTheme()
  // Унікальне name: на сторінці може бути кілька перемикачів (хедер і мобільне меню)
  const name = useId()

  return (
    <fieldset className={cn(styles.switcher, className)}>
      <legend className="visually-hidden">Тема оформлення</legend>
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <label
          key={value}
          className={cn(styles.option, preference === value && styles.active)}
          title={label}
        >
          <input
            type="radio"
            name={name}
            value={value}
            checked={preference === value}
            onChange={() => setPreference(value)}
            className="visually-hidden"
          />
          <Icon size={16} aria-hidden="true" />
          <span className="visually-hidden">{label}</span>
        </label>
      ))}
    </fieldset>
  )
}
