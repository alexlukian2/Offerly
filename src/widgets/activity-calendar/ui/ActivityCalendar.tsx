import { Flame, Trophy } from 'lucide-react'
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { Application } from '@/entities/application'
import { cn } from '@/shared/lib/cn'
import { formatLongDate } from '@/shared/lib/format-date'
import { buildCalendar, type CalendarDay } from '../model/buildCalendar'
import styles from './ActivityCalendar.module.css'

type ActivityCalendarProps = {
  applications: Application[]
  now: Date
}

const WEEKDAY_LABELS = ['Пн', '', 'Ср', '', 'Пт', '', ''] // як на GitHub — через рядок

const pluralRules = new Intl.PluralRules('uk')
const FORMS: Record<string, [string, string, string]> = {
  vacancy: ['відгук', 'відгуки', 'відгуків'],
  day: ['день', 'дні', 'днів'],
}
function plural(count: number, word: keyof typeof FORMS) {
  const [one, few, many] = FORMS[word]
  const rule = pluralRules.select(count)
  return `${count} ${rule === 'one' ? one : rule === 'few' ? few : many}`
}

// Календар активності як "contributions" на GitHub: стовпчик = тиждень, клітинка = день.
// Чим більше відгуків за день — тим яскравіше і сильніше "світиться" клітинка
export function ActivityCalendar({ applications, now }: ActivityCalendarProps) {
  const titleId = useId()
  const calendar = buildCalendar(applications, now)
  const [hovered, setHovered] = useState<CalendarDay | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const days = new Map(calendar.weeks.flat().map((day) => [day.key, day]))

  // На вузькому екрані весь рік не вміщається — одразу прокручуємо до сьогодні (праворуч), як GitHub
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [])

  // Один обробник на всю сітку замість 371 окремого: дізнаємось день за data-key клітинки
  function handlePointerOver(event: PointerEvent<HTMLDivElement>) {
    const key = (event.target as HTMLElement).dataset.key
    setHovered(key ? (days.get(key) ?? null) : null)
  }

  const activeDays = calendar.weeks.flat().filter((day) => day.count > 0)

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {plural(calendar.total, 'vacancy')} за останній рік
        </h2>
        <div className={styles.streaks}>
          <span className={cn(styles.streak, calendar.currentStreak > 0 && styles.streakActive)}>
            <Flame size={14} aria-hidden="true" />
            Серія: {plural(calendar.currentStreak, 'day')}
          </span>
          <span className={styles.streak}>
            <Trophy size={14} aria-hidden="true" />
            Рекорд: {plural(calendar.longestStreak, 'day')}
          </span>
        </div>
      </div>

      {/* Сітка — для очей. Для скрінрідера нижче — список днів, коли були відгуки */}
      <div className={styles.scroll} ref={scrollRef} aria-hidden="true">
        <div
          className={styles.calendar}
          style={{ '--weeks': calendar.weeks.length } as CSSProperties}
        >
          <div className={styles.months}>
            {calendar.months.map(({ label, column }) => (
              <span key={column} style={{ gridColumnStart: column + 1 }}>
                {label}
              </span>
            ))}
          </div>

          <div className={styles.weekdays}>
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>

          <div
            className={styles.grid}
            onPointerOver={handlePointerOver}
            onPointerLeave={() => setHovered(null)}
          >
            {calendar.weeks.flat().map((day) => (
              <span
                key={day.key}
                data-key={day.isFuture ? undefined : day.key}
                className={cn(styles.cell, day.isFuture && styles.future)}
                data-level={day.level}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.info} aria-hidden="true">
          {hovered
            ? `${formatLongDate(hovered.date.toISOString())} — ${hovered.count === 0 ? 'без відгуків' : plural(hovered.count, 'vacancy')}`
            : 'Наведи на день, щоб побачити кількість'}
        </p>
        <div className={styles.legend} aria-hidden="true">
          Менше
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={styles.cell} data-level={level} />
          ))}
          Більше
        </div>
      </div>

      <div className="visually-hidden">
        <h3>Дні з відгуками</h3>
        <ul>
          {activeDays.map((day) => (
            <li key={day.key}>
              {formatLongDate(day.date.toISOString())}: {plural(day.count, 'vacancy')}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
