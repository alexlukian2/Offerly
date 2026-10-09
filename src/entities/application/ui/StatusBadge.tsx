import type { CSSProperties } from 'react'
import { STATUS_COLORS, STATUS_LABELS } from '../model/labels'
import type { ApplicationStatus } from '../model/types'
import styles from './StatusBadge.module.css'

type StatusBadgeProps = {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // --stage — сам колір етапу (фон, рамка, крапка); --stage-ink — темніший відтінок для тексту,
  // щоб пастельний колір читався на світлому фоні
  const style = {
    '--stage': STATUS_COLORS[status],
    '--stage-ink': `var(--color-status-${status}-ink)`,
  } as CSSProperties

  return (
    <span className={styles.badge} style={style}>
      <span className={styles.dot} />
      {STATUS_LABELS[status]}
    </span>
  )
}
