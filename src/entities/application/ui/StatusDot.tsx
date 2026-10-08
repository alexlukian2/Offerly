import { STATUS_COLORS } from '../model/labels'
import type { ApplicationStatus } from '../model/types'
import styles from './StatusDot.module.css'

export function StatusDot({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={styles.dot}
      style={{ backgroundColor: STATUS_COLORS[status] }}
      aria-hidden="true"
    />
  )
}
