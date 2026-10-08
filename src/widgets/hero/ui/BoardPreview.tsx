import { MapPin } from 'lucide-react'
import { previewColumns } from '../model/boardPreviewData'
import styles from './BoardPreview.module.css'

export function BoardPreview() {
  return (
    <div className={styles.preview} aria-hidden="true">
      <div className={styles.toolbar}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.url}>app.offerly.dev/board</span>
      </div>

      <div className={styles.columns}>
        {previewColumns.map((column) => (
          <div key={column.id} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.status} style={{ backgroundColor: column.color }} />
              {column.title}
              <span className={styles.count}>{column.cards.length}</span>
            </div>

            {column.cards.map((card) => (
              <div key={card.id} className={styles.card}>
                <p className={styles.company}>{card.company}</p>
                <p className={styles.role}>{card.role}</p>
                <div className={styles.meta}>
                  <span>
                    <MapPin size={12} />
                    {card.location}
                  </span>
                  {card.salary && <span>{card.salary}</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
