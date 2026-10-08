import { Search, X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './SearchInput.module.css'

type SearchInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  onClear?: () => void
}

export function SearchInput({ className, value, onClear, ...rest }: SearchInputProps) {
  const hasValue = typeof value === 'string' && value.length > 0

  return (
    <div className={cn(styles.wrapper, className)}>
      <Search size={18} className={styles.icon} aria-hidden="true" />
      <input type="search" value={value} className={styles.input} {...rest} />
      {hasValue && onClear && (
        <button type="button" className={styles.clear} onClick={onClear} aria-label="Очистити пошук">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
