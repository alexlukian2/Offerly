import { ChartColumn } from 'lucide-react'
import { useState } from 'react'
import { countByStatus, useApplications } from '@/entities/application'
import { ROUTES } from '@/shared/config/routes'
import { formatPercent } from '@/shared/lib/format-number'
import { ButtonLink } from '@/shared/ui/button'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { ErrorPanel } from '@/shared/ui/error-panel'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { ApplicationFunnel } from '@/widgets/application-funnel'
import { WeeklyActivity } from '@/widgets/weekly-activity'
import styles from './StatsPage.module.css'

export function StatsPage() {
  const applications = useApplications()

  // "Зараз" фіксуємо один раз при відкритті сторінки: new Date() у тілі компонента
  // давав би інше значення при кожному рендері — рендер перестав би бути чистим
  const [now] = useState(() => new Date())

  if (applications.length === 0) {
    return (
      <>
        <title>Статистика — Offerly</title>
        <PageHeader title="Статистика" description="Як рухаються твої відгуки по воронці." />
        <EmptyState
          icon={ChartColumn}
          title="Поки що нічого рахувати"
          description="Статистика з’явиться, щойно ти додаси перші вакансії на дошку."
          action={<ButtonLink href={ROUTES.board}>Перейти до дошки</ButtonLink>}
        />
      </>
    )
  }

  const counts = countByStatus(applications)
  const sentCount = applications.length - counts.wishlist
  const inProgress = counts.applied + counts.test + counts.interview

  const summary = [
    { label: 'Надіслано відгуків', value: String(sentCount) },
    { label: 'У процесі', value: String(inProgress) },
    { label: 'Оферів', value: String(counts.offer) },
    {
      label: 'Конверсія в офер',
      value: sentCount === 0 ? '—' : formatPercent(counts.offer / sentCount),
    },
  ]

  return (
    <>
      <title>Статистика — Offerly</title>
      <PageHeader title="Статистика" description="Як рухаються твої відгуки по воронці." />

      <dl className={styles.summary}>
        {summary.map(({ label, value }) => (
          <div key={label} className={styles.tile}>
            <dt className={styles.tileLabel}>{label}</dt>
            <dd className={styles.tileValue}>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.grid}>
        {/* Кожен віджет — у власній межі помилок: якщо один впаде, другий продовжить працювати */}
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <ApplicationFunnel applications={applications} />
        </ErrorBoundary>
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <WeeklyActivity applications={applications} now={now} />
        </ErrorBoundary>
      </div>
    </>
  )
}

function WidgetError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorPanel
      title="Не вдалося показати цей блок"
      description="Решта статистики працює. Спробуй ще раз — або онови сторінку."
      onRetry={onRetry}
    />
  )
}
