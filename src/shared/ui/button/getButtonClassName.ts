import { cn } from '@/shared/lib/cn'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'ghost' | 'inverse' | 'danger' | 'dangerSoft'
export type ButtonSize = 'sm' | 'md' | 'lg'

export function getButtonClassName(variant: ButtonVariant, size: ButtonSize) {
  return cn(styles.button, styles[variant], styles[size])
}
