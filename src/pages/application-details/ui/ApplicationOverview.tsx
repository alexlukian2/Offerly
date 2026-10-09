import { BellRing, CalendarDays, Hourglass } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { STATUS_COLORS, type Application } from '@/entities/application'
import { cn } from '@/shared/lib/cn'
import { pluralWord, WORDS } from '@/shared/lib/plural'
import { useCountUp } from '@/shared/lib/use-count-up'
import { MiniRing } from '@/shared/ui/micro-charts'
import styles from './ApplicationOverview.module.css'

const DAY_MS = 86_400_000
const STALE_DAYS = 14 // той самий поріг, що й у "Потребують уваги" на статистиці
const WAITING = new Set(['applied', 'test', 'interview'])

// "через 2 д 4 год", "через 35 хв", "настало"
function formatCountdown(ms: number) {
  if (ms <= 0) return 'настало'
  const minutes = Math.round(ms / 60_000)
  if (minutes < 60) return `через ${minutes} хв`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `через ${hours} год ${minutes % 60} хв`
  return `через ${Math.floor(hours / 24)} д ${hours % 24} год`
}

type ApplicationOverviewProps = {
  application: Application
}

// Три плитки-інфографіки над шляхом вакансії: скільки на дошці, скільки без руху, коли нагадування
export function ApplicationOverview({ application }: ApplicationOverviewProps) {
  // "Зараз" фіксуємо один раз: рендер лишається чистим (як на сторінці статистики)
  const [now] = useState(() => Date.now())
  const daysOnBoard = Math.max(
    0,
    Math.floor((now - new Date(application.createdAt).getTime()) / DAY_MS),
  )
  const sinceChange = application.statusChangedAt ?? application.createdAt
  const daysOnStage = Math.max(0, Math.floor((now - new Date(sinceChange).getTime()) / DAY_MS))
  const isWaiting = WAITING.has(application.status)
  // Колір кільця "без руху": зелений — свіжа, жовтий — пора нагадати про себе, рожевий — застрягла
  const stageColor =
    daysOnStage >= STALE_DAYS
      ? STATUS_COLORS.rejected
      : daysOnStage >= STALE_DAYS / 2
        ? STATUS_COLORS.test
        : STATUS_COLORS.offer

  return (
    <div className={styles.overview}>
      <Tile
        icon={<CalendarDays size={16} />}
        label="На дошці"
        value={daysOnBoard}
        unit={pluralWord(daysOnBoard, WORDS.day)}
      />
      <Tile
        icon={<Hourglass size={16} />}
        label={isWaiting ? 'Без руху' : 'На цьому етапі'}
        value={daysOnStage}
        unit={pluralWord(daysOnStage, WORDS.day)}
        visual={
          isWaiting ? (
            <MiniRing value={Math.min(daysOnStage / STALE_DAYS, 1)} color={stageColor} />
          ) : undefined
        }
        hint={isWaiting ? `поріг уваги — ${STALE_DAYS} днів` : undefined}
        alert={isWaiting && daysOnStage >= STALE_DAYS}
      />
      <div className={cn(styles.tile, application.remindAt && styles.holo)}>
        <span className={styles.label}>
          <BellRing size={16} aria-hidden="true" />
          Нагадування
        </span>
        <span className={styles.text}>
          {application.remindAt
            ? formatCountdown(new Date(application.remindAt).getTime() - now)
            : 'Не стоїть'}
        </span>
        {application.remindNote && <span className={styles.hint}>{application.remindNote}</span>}
      </div>
    </div>
  )
}

type TileProps = {
  icon: ReactNode
  label: string
  value: number
  unit: string
  visual?: ReactNode
  hint?: string
  alert?: boolean
}

function Tile({ icon, label, value, unit, visual, hint, alert }: TileProps) {
  const shown = useCountUp(value)
  return (
    <div className={cn(styles.tile, alert && styles.alert)}>
      <span className={styles.label}>
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
      <div className={styles.row}>
        <span className={styles.value}>
          {shown} <small>{unit}</small>
        </span>
        {visual}
      </div>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
