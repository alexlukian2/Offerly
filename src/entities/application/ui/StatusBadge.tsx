import { STATUS_COLORS, STATUS_LABELS } from '../model/labels'
import type { ApplicationStatus } from '../model/types'
import styles from './StatusBadge.module.css'

type StatusBadgeProps = {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={styles.badge}>
      <span className={styles.dot} style={{ backgroundColor: STATUS_COLORS[status] }} />
      {STATUS_LABELS[status]}
    </span>
  )
}
