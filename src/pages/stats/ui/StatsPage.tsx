import { ChartColumn, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { countByStatus, useApplications } from '@/entities/application'
import { ROUTES } from '@/shared/config/routes'
import { formatPercent } from '@/shared/lib/format-number'
import { ButtonLink } from '@/shared/ui/button'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { ErrorPanel } from '@/shared/ui/error-panel'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { SegmentedControl } from '@/shared/ui/segmented-control'
import { ActivityCalendar } from '@/widgets/activity-calendar'
import { ApplicationFunnel } from '@/widgets/application-funnel'
import { StaleApplications } from '@/widgets/stale-applications'
import { WeeklyActivity } from '@/widgets/weekly-activity'
import { WeeklyGoal } from '@/widgets/weekly-goal'
import {
  countSent,
  inPeriod,
  PERIOD_LABELS,
  PERIOD_PHRASES,
  PERIODS,
  periodDays,
  usePeriod,
  type Period,
} from '../model/period'
import styles from './StatsPage.module.css'

export function StatsPage() {
  const applications = useApplications()

  // "Зараз" фіксуємо один раз при відкритті сторінки: new Date() у тілі компонента
  // давав би інше значення при кожному рендері — рендер перестав би бути чистим
  const [now] = useState(() => new Date())
  const [period, setPeriod] = usePeriod()

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

  // Плитки, воронка і графік — за вибраний період; календар, ціль і "Потребують уваги" — завжди повні
  const current = inPeriod(applications, period, now)
  const previous = inPeriod(applications, period, now, 1)
  const counts = countByStatus(current)
  const sentCount = countSent(current)
  const inProgress = counts.applied + counts.test + counts.interview

  const summary = [
    {
      label: 'Надіслано відгуків',
      value: String(sentCount),
      delta: sentCount - countSent(previous),
    },
    { label: 'У процесі', value: String(inProgress) },
    {
      label: 'Оферів',
      value: String(counts.offer),
      delta: counts.offer - countByStatus(previous).offer,
    },
    {
      label: 'Конверсія в офер',
      value: sentCount === 0 ? '—' : formatPercent(counts.offer / sentCount),
    },
  ]

  return (
    <>
      <title>Статистика — Offerly</title>
      <PageHeader
        title="Статистика"
        description="Як рухаються твої відгуки по воронці."
        actions={
          <SegmentedControl<Period>
            label="Період"
            value={period}
            onChange={setPeriod}
            options={PERIODS.map((value) => ({ value, label: PERIOD_LABELS[value] }))}
          />
        }
      />

      <dl className={styles.summary}>
        {summary.map(({ label, value, delta }) => (
          <div key={label} className={styles.tile}>
            <dt className={styles.tileLabel}>{label}</dt>
            <dd className={styles.tileValue}>{value}</dd>
            {/* Тренд — лише коли є з чим порівнювати (для "Увесь час" попереднього періоду немає) */}
            {delta !== undefined && period !== 'all' && (
              <dd className={styles.trend} data-direction={Math.sign(delta)}>
                {delta > 0 && <TrendingUp size={14} aria-hidden="true" />}
                {delta < 0 && <TrendingDown size={14} aria-hidden="true" />}
                {delta > 0 ? `+${delta}` : delta === 0 ? 'Так само' : delta}{' '}
                <span>порівняно з {PERIOD_PHRASES[period]}</span>
              </dd>
            )}
          </div>
        ))}
      </dl>

      <div className={styles.overview}>
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <ActivityCalendar applications={applications} now={now} />
        </ErrorBoundary>
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <WeeklyGoal applications={applications} now={now} />
        </ErrorBoundary>
      </div>

      <div className={styles.section}>
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <StaleApplications applications={applications} now={now} />
        </ErrorBoundary>
      </div>

      <div className={styles.grid}>
        {/* Кожен віджет — у власній межі помилок: якщо один впаде, другий продовжить працювати */}
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <ApplicationFunnel applications={current} />
        </ErrorBoundary>
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <WeeklyActivity applications={current} now={now} periodDays={periodDays(period)} />
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
