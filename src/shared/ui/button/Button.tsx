import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import { getButtonClassName, type ButtonSize, type ButtonVariant } from './getButtonClassName'

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(getButtonClassName(variant, size), className)}
      {...rest}
    />
  )
}
