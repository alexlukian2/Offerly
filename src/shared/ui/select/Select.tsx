import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Select.module.css'

export type SelectOption<Value extends string> = {
  value: Value
  label: string
  // Необов'язкова позначка перед текстом (кольорова крапка статусу, іконка)
  marker?: ReactNode
}

type SelectProps<Value extends string> = {
  value: Value
  onValueChange: (value: Value) => void
  options: readonly SelectOption<Value>[]
  id?: string
  ref?: Ref<HTMLButtonElement>
  onBlur?: () => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

// Випадний список у стилі застосунку. Уся складна поведінка — від Radix:
// клавіатура (стрілки, Home/End, пошук за першими літерами), фокус, позиціонування біля краю екрана,
// закриття по Escape і кліку поза списком, правильні ролі для скрінрідера (combobox + listbox).
// Наша частина — лише вигляд і типи
export function Select<Value extends string>({
  value,
  onValueChange,
  options,
  id,
  ref,
  onBlur,
  disabled,
  className,
  ...aria
}: SelectProps<Value>) {
  const selected = options.find((option) => option.value === value)

  return (
    <RadixSelect.Root
      value={value}
      // Radix повертає string; значення гарантовано одне з наших options, тож звужуємо тип
      onValueChange={(next) => onValueChange(next as Value)}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        ref={ref}
        id={id}
        onBlur={onBlur}
        className={cn(styles.trigger, className)}
        {...aria}
      >
        <span className={styles.triggerValue}>
          {selected?.marker}
          <RadixSelect.Value />
        </span>
        <RadixSelect.Icon className={styles.chevron}>
          <ChevronDown size={16} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      {/* Портал у body: список не обріже ні модалка, ні контейнер з overflow */}
      <RadixSelect.Portal>
        <RadixSelect.Content position="popper" sideOffset={6} className={styles.content}>
          <RadixSelect.Viewport className={styles.viewport}>
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className={styles.item}>
                {option.marker}
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className={styles.indicator}>
                  <Check size={16} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
