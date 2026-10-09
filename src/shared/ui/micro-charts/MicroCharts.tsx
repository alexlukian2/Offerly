import { useId, type CSSProperties } from 'react'
import styles from './MicroCharts.module.css'

// Маленькі графіки всередині плиток статистики. Лише для очей (aria-hidden):
// саме число й тренд поруч уже прочитає скрінрідер

type SparklineProps = {
  values: number[]
  color: string
}

// Лінія тренду з м'якою заливкою під нею і точкою на останньому значенні.
// Лінія "домальовується" при появі: pathLength=1 + анімація stroke-dashoffset від 1 до 0
export function Sparkline({ values, color }: SparklineProps) {
  const gradientId = useId()
  const width = 120
  const height = 36
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => [
    values.length === 1 ? width : (index / (values.length - 1)) * width,
    height - 3 - (value / max) * (height - 8),
  ])
  const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lastX, lastY] = points.at(-1) ?? [width, height]

  return (
    <svg
      className={styles.sparkline}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ '--line': color } as CSSProperties}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${gradientId})`} />
      <path className={styles.line} d={line} pathLength={1} />
      <circle className={styles.end} cx={lastX} cy={lastY} r="3.5" />
    </svg>
  )
}

type StackedBarProps = {
  segments: { value: number; color: string; label: string }[]
}

// Смуга з кольорових частин: які етапи складають число. Частини "виростають" одна за одною
export function StackedBar({ segments }: StackedBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  return (
    <div className={styles.stacked} aria-hidden="true">
      <div className={styles.bar}>
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment, index) => (
            <span
              key={segment.label}
              style={
                {
                  flexGrow: segment.value,
                  background: segment.color,
                  '--i': index,
                } as CSSProperties
              }
            />
          ))}
        {total === 0 && <span className={styles.empty} />}
      </div>
      <div className={styles.legend}>
        {segments.map((segment) => (
          <span key={segment.label}>
            <i style={{ background: segment.color }} />
            {segment.label} {segment.value}
          </span>
        ))}
      </div>
    </div>
  )
}

type MiniRingProps = {
  value: number // 0..1
  color: string
}

// Кільце-відсоток: заповнюється від 0 до значення при появі
export function MiniRing({ value, color }: MiniRingProps) {
  const radius = 15
  return (
    <svg className={styles.ring} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r={radius} className={styles.track} />
      <circle
        cx="20"
        cy="20"
        r={radius}
        className={styles.value}
        stroke={color}
        pathLength={100}
        strokeDasharray={`${Math.max(value * 100, 0.01)} 100`}
      />
    </svg>
  )
}
