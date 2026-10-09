import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { getButtonClassName, type ButtonSize, type ButtonVariant } from './getButtonClassName'

type ButtonLinkProps = {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className: extraClassName,
  children,
}: ButtonLinkProps) {
  const className = cn(getButtonClassName(variant, size), extraClassName)

  // Внутрішні маршрути ("/app") — через роутер, без перезавантаження сторінки.
  // Якорі ("#faq") і зовнішні посилання — звичайним <a>.
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
