import { useId } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Application } from '@/entities/application'
import { formatShortDate } from '@/shared/lib/format-date'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import { ChartTooltip } from '@/shared/ui/chart-tooltip'
import { groupByWeek } from '../model/groupByWeek'
import styles from './WeeklyActivity.module.css'

type WeeklyActivityProps = {
  applications: Application[]
  now: Date
}

type WeekTickProps = {
  x?: number
  y?: number
  payload?: { value: string; index: number }
  currentIndex: number
}

// Свій підпис осі: "17" / "серп." у два рядки (8 тижнів мають вміститися навіть на телефоні),
// поточний тиждень — жирним. Колір тексту — текстовий токен, не колір даних
function WeekTick({ x = 0, y = 0, payload, currentIndex }: WeekTickProps) {
  if (!payload) return null
  const [day, month] = payload.value.split(' ')
  const isCurrent = payload.index === currentIndex

  return (
    <text
      x={x}
      y={y + 14}
      textAnchor="middle"
      fontSize={11}
      fontWeight={isCurrent ? 800 : 500}
      fill={isCurrent ? 'var(--color-heading)' : 'var(--chart-axis)'}
    >
      <tspan x={x}>{day}</tspan>
      <tspan x={x} dy={13}>
        {month}
      </tspan>
    </text>
  )
}

export function WeeklyActivity({ applications, now }: WeeklyActivityProps) {
  const titleId = useId()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const weeks = groupByWeek(applications, now)
  const total = weeks.reduce((sum, week) => sum + week.count, 0)
  const currentIndex = weeks.findIndex((week) => week.isCurrent)

  const data = weeks.map((week) => ({
    key: week.key,
    label: formatShortDate(week.start),
    count: week.count,
  }))

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Активність за тижнями
      </h2>
      <p className={styles.hint}>
        Відгуків за останні {weeks.length} тижнів: <strong>{total}</strong>
      </p>

      {/* Графік — для очей; для скрінрідера нижче є таблиця з тими самими даними */}
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 4, bottom: 8, left: -24 }}
            accessibilityLayer={false}
          >
            {/* Сітка: лише горизонтальні тонкі лінії, суцільні, на крок від фону — тиха, не відволікає */}
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              interval={0}
              height={36}
              tickLine={false}
              axisLine={{ stroke: 'var(--chart-grid)' }}
              tick={<WeekTick currentIndex={currentIndex} />}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-surface)' }}
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as (typeof data)[number] | undefined
                if (!active || !item) return null
                return <ChartTooltip value={`${item.count}`} label={`Тиждень з ${item.label}`} />
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-bar)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={!reduceMotion}
            >
              {/* Значення над стовпчиками — лише ненульові: нулі вже видно з відсутності стовпчика */}
              <LabelList
                dataKey="count"
                position="top"
                fill="var(--color-heading)"
                fontSize={12}
                fontWeight={700}
                formatter={(value) => (Number(value) > 0 ? String(value) : '')}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ховаємо обгортку, а не саму таблицю: таблиці ігнорують width/height 1px (урок 15) */}
      <div className="visually-hidden">
        <table>
          <caption>Кількість відгуків за тижнями</caption>
          <thead>
            <tr>
              <th scope="col">Тиждень, що починається</th>
              <th scope="col">Відгуків</th>
            </tr>
          </thead>
          <tbody>
            {data.map((week) => (
              <tr key={week.key}>
                <td>{week.label}</td>
                <td>{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
