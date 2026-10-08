import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './IconButton.module.css'

type IconButtonProps = ComponentProps<'button'> & {
  label: string
}

export function IconButton({ label, type = 'button', className, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(styles.iconButton, className)}
      {...rest}
    />
  )
}
