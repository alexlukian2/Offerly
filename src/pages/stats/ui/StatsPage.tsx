import { ChartColumn } from 'lucide-react'
import { useState } from 'react'
import { countByStatus, STATUS_COLORS, useApplications } from '@/entities/application'
import { ROUTES } from '@/shared/config/routes'
import { ButtonLink } from '@/shared/ui/button'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { ErrorPanel } from '@/shared/ui/error-panel'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { MiniRing, Sparkline, StackedBar } from '@/shared/ui/micro-charts'
import { SegmentedControl } from '@/shared/ui/segmented-control'
import { ActivityCalendar } from '@/widgets/activity-calendar'
import { ApplicationFunnel } from '@/widgets/application-funnel'
import { StageDonut } from '@/widgets/stage-donut'
import { StaleApplications } from '@/widgets/stale-applications'
import { groupActivity, WeeklyActivity } from '@/widgets/weekly-activity'
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
import { StatTile } from './StatTile'
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

  const hasTrend = period !== 'all'
  const conversion = sentCount === 0 ? 0 : counts.offer / sentCount
  // Ряди для міні-ліній: ті самі "кошики", що й у графіку активності (по днях або по тижнях)
  const activity = groupActivity(current, now, periodDays(period)).buckets
  const offerActivity = groupActivity(
    current.filter((application) => application.status === 'offer'),
    now,
    periodDays(period),
  ).buckets

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
        <StatTile
          label="Надіслано відгуків"
          value={sentCount}
          holo
          delta={hasTrend ? sentCount - countSent(previous) : undefined}
          deltaPhrase={PERIOD_PHRASES[period]}
          visual={<Sparkline values={activity.map(({ count }) => count)} color={STATUS_COLORS.applied} />}
        />
        <StatTile
          label="У процесі"
          value={inProgress}
          visual={
            <StackedBar
              segments={[
                { label: 'Відгук', value: counts.applied, color: STATUS_COLORS.applied },
                { label: 'Тестове', value: counts.test, color: STATUS_COLORS.test },
                { label: 'Інтерв’ю', value: counts.interview, color: STATUS_COLORS.interview },
              ]}
            />
          }
        />
        <StatTile
          label="Оферів"
          value={counts.offer}
          delta={hasTrend ? counts.offer - countByStatus(previous).offer : undefined}
          deltaPhrase={PERIOD_PHRASES[period]}
          visual={<Sparkline values={offerActivity.map(({ count }) => count)} color={STATUS_COLORS.offer} />}
        />
        <StatTile
          label="Конверсія в офер"
          value={Math.round(conversion * 100)}
          suffix="%"
          visual={<MiniRing value={conversion} color={STATUS_COLORS.offer} />}
        />
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
        {/* Кожен віджет — у власній межі помилок: якщо один впаде, інші продовжать працювати */}
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <StageDonut applications={current} />
        </ErrorBoundary>
        <ErrorBoundary fallback={({ reset }) => <WidgetError onRetry={reset} />}>
          <ApplicationFunnel applications={current} />
        </ErrorBoundary>
      </div>

      <div className={styles.section}>
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
