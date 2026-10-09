import { useId, type CSSProperties } from 'react'
import {
  APPLICATION_STATUSES,
  countByStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  type Application,
} from '@/entities/application'
import { formatPercent } from '@/shared/lib/format-number'
import { useCountUp } from '@/shared/lib/use-count-up'
import styles from './StageDonut.module.css'

type StageDonutProps = {
  applications: Application[]
}

const GAP = 1.2 // проміжок між сегментами, у "відсотках" кола

// Кільцева діаграма: як розподілені вакансії за етапами. Кожен сегмент — колір свого етапу,
// між сегментами — тонкий проміжок фону, щоб сусідні кольори не зливались
export function StageDonut({ applications }: StageDonutProps) {
  const titleId = useId()
  const counts = countByStatus(applications)
  const total = applications.length
  const shownTotal = useCountUp(total)

  // Кожен сегмент починається там, де закінчились попередні: зсув = сума часток перед ним
  const present = APPLICATION_STATUSES.filter((status) => counts[status] > 0)
  const shares = present.map((status) => (counts[status] / total) * 100)
  const segments = present.map((status, index) => ({
    status,
    index,
    share: shares[index],
    offset: shares.slice(0, index).reduce((sum, share) => sum + share, 0),
  }))

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Етапи
      </h2>
      <p className={styles.hint}>Як розподілені вакансії за період</p>

      <div className={styles.body}>
        <div className={styles.chart}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="46" className={styles.track} />
            {segments.map(({ status, share, offset: start, index }) => (
              <circle
                key={status}
                cx="60"
                cy="60"
                r="46"
                pathLength={100}
                className={styles.segment}
                stroke={STATUS_COLORS[status]}
                strokeDasharray={`${Math.max(share - (segments.length > 1 ? GAP : 0), 0.5)} 100`}
                strokeDashoffset={-start}
                style={{ '--i': index } as CSSProperties}
              />
            ))}
          </svg>
          <p className={styles.center}>
            <strong>{shownTotal}</strong>
            <span>вакансій</span>
          </p>
        </div>

        <ul className={styles.legend}>
          {APPLICATION_STATUSES.map((status) => (
            <li key={status}>
              <i style={{ background: STATUS_COLORS[status], color: STATUS_COLORS[status] }} />
              {STATUS_LABELS[status]}
              <b>{counts[status]}</b>
              <span>{total === 0 ? '—' : formatPercent(counts[status] / total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
