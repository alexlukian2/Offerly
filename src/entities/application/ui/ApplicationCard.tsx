import { Bell, ExternalLink, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { formatShortDate } from '@/shared/lib/format-date'
import { WORK_FORMAT_LABELS } from '../model/labels'
import { formatReminder } from '../model/reminder'
import type { Application } from '../model/types'
import styles from './ApplicationCard.module.css'

type ApplicationCardProps = {
  application: Application
  actions?: ReactNode
  href?: string
  // Додаткові позначки під форматом і зарплатою (наприклад, кількість нотаток — її знає дошка)
  extra?: ReactNode
}

export function ApplicationCard({ application, actions, href, extra }: ApplicationCardProps) {
  const { company, position, workFormat, salary, url, createdAt, remindAt } = application

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.company}>
          {href ? (
            // Посилання на назві компанії "розтягується" на всю картку через ::after —
            // клік будь-де по картці відкриває сторінку вакансії
            <Link to={href} className={styles.openLink}>
              {company}
            </Link>
          ) : (
            company
          )}
        </h3>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={styles.externalLink}
            aria-label={`Відкрити вакансію ${company} у новій вкладці`}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <p className={styles.position}>{position}</p>

      <div className={styles.meta}>
        <span className={styles.format}>
          <MapPin size={12} />
          {WORK_FORMAT_LABELS[workFormat]}
        </span>
        {salary && <span>{salary}</span>}
      </div>

      {extra}

      {remindAt && (
        <p className={styles.reminder}>
          <Bell size={12} aria-hidden="true" />
          <span className="visually-hidden">Нагадування:</span>
          {formatReminder(remindAt)}
        </p>
      )}

      <div className={styles.footer}>
        <time dateTime={createdAt} className={styles.date}>
          {formatShortDate(createdAt)}
        </time>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </article>
  )
}
