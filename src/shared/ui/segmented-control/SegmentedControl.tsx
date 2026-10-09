import { useId } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './SegmentedControl.module.css'

export type SegmentedOption<Value extends string> = { value: Value; label: string }

type SegmentedControlProps<Value extends string> = {
  label: string // назва групи для скрінрідера: "Період"
  value: Value
  options: SegmentedOption<Value>[]
  onChange: (value: Value) => void
  className?: string
}

// Кілька взаємовиключних варіантів у ряд. Під капотом — нативні радіокнопки:
// стрілки для вибору й оголошення "2 з 4" браузер дає сам
export function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<Value>) {
  const name = useId()

  return (
    <fieldset className={cn(styles.control, className)}>
      <legend className="visually-hidden">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className={cn(styles.option, option.value === value && styles.active)}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="visually-hidden"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
