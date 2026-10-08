import { RotateCcw, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import styles from './ErrorPanel.module.css'

type ErrorPanelProps = {
  title: string
  description: string
  onRetry?: () => void
  retryLabel?: string
  extraAction?: ReactNode
}

export function ErrorPanel({
  title,
  description,
  onRetry,
  retryLabel = 'Спробувати знову',
  extraAction,
}: ErrorPanelProps) {
  return (
    <div className={styles.panel} role="alert">
      <span className={styles.icon}>
        <TriangleAlert size={24} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {(onRetry || extraAction) && (
        <div className={styles.actions}>
          {onRetry && (
            <Button variant="ghost" onClick={onRetry}>
              <RotateCcw size={16} />
              {retryLabel}
            </Button>
          )}
          {extraAction}
        </div>
      )}
    </div>
  )
}
