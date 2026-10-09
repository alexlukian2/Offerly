import { ChevronRight, CircleCheck, Hourglass } from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router'
import { StatusBadge, type Application, type ApplicationStatus } from '@/entities/application'
import { getApplicationPath } from '@/shared/config/routes'
import { plural, WORDS } from '@/shared/lib/plural'
import { findStale, STALE_AFTER_DAYS } from '../model/findStale'
import styles from './StaleApplications.module.css'

type StaleApplicationsProps = {
  applications: Application[]
  now: Date
}

// Що робити далі — залежно від етапу, на якому застрягла вакансія
const ADVICE: Partial<Record<ApplicationStatus, string>> = {
  applied: 'Нагадай про себе рекрутеру або закрий як відмову',
  test: 'Уточни, чи переглянули тестове',
  interview: 'Попроси фідбек після співбесіди',
}

const MAX_ITEMS = 5

export function StaleApplications({ applications, now }: StaleApplicationsProps) {
  const titleId = useId()
  const stale = findStale(applications, now)

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        <Hourglass size={18} aria-hidden="true" />
        Потребують уваги
        {stale.length > 0 && <span className={styles.badge}>{stale.length}</span>}
      </h2>
      <p className={styles.hint}>Вакансії, що стоять на етапі понад {STALE_AFTER_DAYS} днів</p>

      {stale.length === 0 ? (
        <p className={styles.empty}>
          <CircleCheck size={18} aria-hidden="true" />
          Усе рухається — нічого не застрягло
        </p>
      ) : (
        <ul className={styles.list}>
          {stale.slice(0, MAX_ITEMS).map(({ application, days: count }) => (
            <li key={application.id}>
              <Link to={getApplicationPath(application.id)} className={styles.item}>
                <div className={styles.main}>
                  <p className={styles.company}>
                    {application.company}
                    <StatusBadge status={application.status} />
                  </p>
                  <p className={styles.advice}>{ADVICE[application.status]}</p>
                </div>
                <span className={styles.days}>{plural(count, WORDS.day)}</span>
                <ChevronRight size={16} aria-hidden="true" className={styles.chevron} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {stale.length > MAX_ITEMS && (
        <p className={styles.more}>І ще {stale.length - MAX_ITEMS} — на дошці</p>
      )}
    </section>
  )
}
