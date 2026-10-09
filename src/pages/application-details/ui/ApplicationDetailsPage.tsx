import { ArrowLeft, ExternalLink, Pencil, SearchX } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  formatReminder,
  StageJourney,
  useApplications,
  WORK_FORMAT_LABELS,
} from '@/entities/application'
import { DeleteApplicationButton } from '@/features/delete-application'
import { EditApplicationModal } from '@/features/edit-application'
import { MoveApplicationButtons } from '@/features/move-application'
import { ShareButton } from '@/features/share-application'
import { ROUTES } from '@/shared/config/routes'
import { formatLongDate } from '@/shared/lib/format-date'
import { useDisclosure } from '@/shared/lib/use-disclosure'
import { Button, ButtonLink } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { ApplicationNotes } from './ApplicationNotes'
import { ApplicationOverview } from './ApplicationOverview'
import styles from './ApplicationDetailsPage.module.css'

export function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const applications = useApplications()
  const editor = useDisclosure()

  const application = applications.find((item) => item.id === id)

  if (!application) {
    return (
      <>
        <title>Вакансію не знайдено — Offerly</title>
        <EmptyState
          icon={SearchX}
          title="Вакансію не знайдено"
          description="Можливо, її видалили, або посилання містить помилку."
          action={<ButtonLink href={ROUTES.board}>Повернутися до дошки</ButtonLink>}
        />
      </>
    )
  }

  function handleDeleted() {
    // replace: сторінки видаленої вакансії не буде в історії — "Назад" не поверне на неї
    navigate(ROUTES.board, { replace: true })
  }

  const details = [
    { label: 'Формат роботи', value: WORK_FORMAT_LABELS[application.workFormat] },
    { label: 'Зарплата', value: application.salary ?? 'Не вказано' },
    { label: 'Додано', value: formatLongDate(application.createdAt) },
    {
      label: 'Нагадування',
      value: application.remindAt
        ? [formatReminder(application.remindAt), application.remindNote].filter(Boolean).join(' — ')
        : 'Немає',
    },
  ]

  return (
    <>
      <title>{`${application.company} — Offerly`}</title>

      <nav aria-label="Навігаційний ланцюжок" className={styles.breadcrumbs}>
        <Link to={ROUTES.board} className={styles.back}>
          <ArrowLeft size={16} />
          Дошка
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{application.company}</span>
      </nav>

      <header className={styles.header}>
        <div>
          <h1 className={styles.company}>{application.company}</h1>
          <p className={styles.position}>{application.position}</p>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={editor.open}>
            <Pencil size={16} />
            Редагувати
          </Button>
          <ShareButton applicationId={application.id} />
          <DeleteApplicationButton application={application} onDeleted={handleDeleted} />
        </div>
      </header>

      <ApplicationOverview application={application} />

      <section className={styles.panel} aria-labelledby="stage-title">
        <h2 id="stage-title" className={styles.panelTitle}>
          Етап відбору
        </h2>
        <StageJourney status={application.status} />
        <div className={styles.stage}>
          <MoveApplicationButtons application={application} />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="details-title">
        <h2 id="details-title" className={styles.panelTitle}>
          Деталі
        </h2>
        <dl className={styles.details}>
          {details.map(({ label, value }) => (
            <div key={label} className={styles.row}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <div className={styles.row}>
            <dt>Посилання</dt>
            <dd>
              {application.url ? (
                <a
                  href={application.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.externalLink}
                >
                  Відкрити вакансію
                  <ExternalLink size={14} />
                </a>
              ) : (
                'Не вказано'
              )}
            </dd>
          </div>
        </dl>
      </section>

      <ApplicationNotes applicationId={application.id} />

      {editor.isOpen && <EditApplicationModal application={application} onClose={editor.close} />}
    </>
  )
}
