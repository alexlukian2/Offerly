import { useId } from 'react'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { STATUS_LABELS, type Application } from '@/entities/application'
import { formatPercent } from '@/shared/lib/format-number'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import { ChartTooltip } from '@/shared/ui/chart-tooltip'
import { buildFunnel } from '../model/buildFunnel'
import styles from './ApplicationFunnel.module.css'

const ROW_HEIGHT = 48

type ApplicationFunnelProps = {
  applications: Application[]
}

export function ApplicationFunnel({ applications }: ApplicationFunnelProps) {
  const titleId = useId()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const stages = buildFunnel(applications)

  // Дані у формі, яку чекає Recharts: масив об'єктів, по одному на смугу
  const data = stages.map((stage, index) => ({
    label: STATUS_LABELS[stage.status],
    count: stage.count,
    conversion: stage.conversion,
    // Етапи впорядковані — один тон, що темнішає до кінця воронки (урок 24)
    fill: `var(--chart-funnel-${index + 1})`,
  }))

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Воронка відбору
      </h2>
      <p className={styles.hint}>Скільки відгуків дійшло щонайменше до кожного етапу</p>

      {/* Графік — для очей; ті самі числа є підписами на смугах і в таблиці нижче */}
      <div className={styles.chart} aria-hidden="true">
        <ResponsiveContainer width="100%" height={data.length * ROW_HEIGHT}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 36, bottom: 0, left: 0 }}
            accessibilityLayer={false}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={112}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-heading)', fontSize: 14, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-surface)' }}
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as (typeof data)[number] | undefined
                if (!active || !item) return null
                return (
                  <ChartTooltip
                    value={`${item.count}`}
                    label={item.label}
                    details={
                      item.conversion === null
                        ? []
                        : [`${formatPercent(item.conversion)} від попереднього етапу`]
                    }
                  />
                )
              }}
            />
            <Bar
              dataKey="count"
              barSize={24}
              radius={[0, 4, 4, 0]}
              minPointSize={2}
              isAnimationActive={!reduceMotion}
            >
              {data.map((item) => (
                <Cell key={item.label} fill={item.fill} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                fill="var(--color-heading)"
                fontSize={14}
                fontWeight={700}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className={styles.conversions}>
        {data.slice(1).map((item) => (
          <li key={item.label}>
            <span className={styles.conversionLabel}>{item.label}</span>
            {item.conversion === null ? '—' : formatPercent(item.conversion)}
          </li>
        ))}
      </ul>

      <div className="visually-hidden">
        <table>
          <caption>Воронка відбору</caption>
          <thead>
            <tr>
              <th scope="col">Етап</th>
              <th scope="col">Вакансій</th>
              <th scope="col">Від попереднього етапу</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                <td>{item.count}</td>
                <td>{item.conversion === null ? '—' : formatPercent(item.conversion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.note}>
        Відмови враховано лише на етапі «Відгукнувся»: ми не зберігаємо, на якому етапі їх
        отримано.
      </p>
    </section>
  )
}
