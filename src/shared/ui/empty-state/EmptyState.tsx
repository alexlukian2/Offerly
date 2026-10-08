import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>
        <Icon size={28} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action}
    </div>
  )
}
