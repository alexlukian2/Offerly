import { TrendingDown, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { useCountUp } from '@/shared/lib/use-count-up'
import styles from './StatsPage.module.css'

type StatTileProps = {
  label: string
  value: number
  suffix?: string // "%" для конверсії
  delta?: number // зміна порівняно з попереднім періодом; немає — тренд не показуємо
  deltaPhrase?: string
  visual?: ReactNode // міні-графік під числом
  holo?: boolean // голографічне число — для головної плитки
}

export function StatTile({ label, value, suffix = '', delta, deltaPhrase, visual, holo }: StatTileProps) {
  const shown = useCountUp(value)

  return (
    <div className={styles.tile}>
      <dt className={styles.tileLabel}>{label}</dt>
      <dd className={cn(styles.tileValue, holo && 'holo-text')}>
        {shown}
        {suffix}
      </dd>
      {delta !== undefined && (
        <dd className={styles.trend} data-direction={Math.sign(delta)}>
          {delta > 0 && <TrendingUp size={14} aria-hidden="true" />}
          {delta < 0 && <TrendingDown size={14} aria-hidden="true" />}
          {delta > 0 ? `+${delta}` : delta === 0 ? 'Так само' : delta} <span>порівняно з {deltaPhrase}</span>
        </dd>
      )}
      {visual && <dd className={styles.visual}>{visual}</dd>}
    </div>
  )
}
