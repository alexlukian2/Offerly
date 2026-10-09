import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowRight, ExternalLink, LinkIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useParams } from 'react-router'
import {
  APPLICATION_STATUSES,
  ApplicationCard,
  sharedContentQueryOptions,
  STATUS_COLORS,
  STATUS_LABELS,
  StatusBadge,
  WORK_FORMAT_LABELS,
  type Application,
} from '@/entities/application'
import { ThemeSwitcher } from '@/features/switch-theme'
import { ROUTES } from '@/shared/config/routes'
import { formatLongDate } from '@/shared/lib/format-date'
import { plural, WORDS } from '@/shared/lib/plural'
import { ButtonLink } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { FloatingShapes } from '@/shared/ui/floating-shapes'
import { Logo } from '@/shared/ui/logo'
import { StageDonut } from '@/widgets/stage-donut'
import styles from './SharedPage.module.css'

// Сторінка гостя: те, чим поділились за посиланням /s/:shareId. Лише перегляд —
// без перетягування, кнопок і входу в акаунт
export function SharedPage() {
  const { shareId = '' } = useParams<{ shareId: string }>()
  const { data: content } = useSuspenseQuery(sharedContentQueryOptions(shareId))

  return (
    <div className={styles.page}>
      <FloatingShapes variant="app" className={styles.shapes} />
      <header className={styles.header}>
        <Logo />
        <div className={styles.headerActions}>
          <ThemeSwitcher />
          <ButtonLink href={ROUTES.board} size="sm">
            Своя дошка
            <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </header>

      <main className={styles.main}>
        {content === null ? (
          <>
            <title>Посилання недійсне — Offerly</title>
            <EmptyState
              icon={LinkIcon}
              title="Посилання недійсне"
              description="Власник вимкнув це посилання, або в адресі помилка."
              action={<ButtonLink href={ROUTES.home}>Що таке Offerly?</ButtonLink>}
            />
          </>
        ) : content.kind === 'board' ? (
          <SharedBoard applications={content.applications} />
        ) : content.applications[0] ? (
          <SharedApplication application={content.applications[0]} />
        ) : (
          <EmptyState
            icon={LinkIcon}
            title="Вакансію видалено"
            description="Власник видалив вакансію, якою поділився."
          />
        )}
      </main>
    </div>
  )
}

function SharedBoard({ applications }: { applications: Application[] }) {
  return (
    <>
      <title>Дошка пошуку роботи — Offerly</title>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Тобою поділились</p>
        <h1 className={styles.title}>Дошка пошуку роботи</h1>
        <p className={styles.subtitle}>
          {plural(applications.length, WORDS.vacancy)} за етапами відбору
        </p>
      </div>

      {/* Загальна картина — до деталей: скільки вакансій на якому етапі */}
      <div className={styles.summary}>
        <StageDonut applications={applications} />
      </div>

      <div className={styles.board}>
        {APPLICATION_STATUSES.map((status) => {
          const items = applications.filter((application) => application.status === status)
          return (
            <section
              key={status}
              className={styles.column}
              aria-labelledby={`shared-${status}`}
              style={{ '--stage': STATUS_COLORS[status] } as CSSProperties}
            >
              <h2 id={`shared-${status}`} className={styles.columnTitle}>
                <span className={styles.dot} style={{ backgroundColor: STATUS_COLORS[status] }} />
                {STATUS_LABELS[status]}
                <span className={styles.count}>{items.length}</span>
              </h2>
              {items.length === 0 ? (
                <p className={styles.empty}>Порожньо</p>
              ) : (
                <ul className={styles.list}>
                  {items.map((application) => (
                    <li key={application.id}>
                      <ApplicationCard application={application} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}

function SharedApplication({ application }: { application: Application }) {
  const details = [
    { label: 'Етап', value: <StatusBadge status={application.status} /> },
    { label: 'Формат роботи', value: WORK_FORMAT_LABELS[application.workFormat] },
    { label: 'Зарплата', value: application.salary ?? 'Не вказано' },
    { label: 'Додано', value: formatLongDate(application.createdAt) },
  ]

  return (
    <>
      <title>{`${application.company} — Offerly`}</title>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Тобою поділились вакансією</p>
        <h1 className={styles.title}>{application.company}</h1>
        <p className={styles.subtitle}>{application.position}</p>
      </div>

      <dl className={styles.details}>
        {details.map(({ label, value }) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {application.url && (
        <a href={application.url} target="_blank" rel="noreferrer" className={styles.external}>
          Відкрити оголошення
          <ExternalLink size={14} />
        </a>
      )}
    </>
  )
}
