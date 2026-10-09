import { Minus, Plus, Target } from 'lucide-react'
import { useId } from 'react'
import type { Application } from '@/entities/application'
import { startOfWeek } from '@/shared/lib/date'
import { useLocalStorage } from '@/shared/lib/storage'
import styles from './WeeklyGoal.module.css'

type WeeklyGoalProps = {
  applications: Application[]
  now: Date
}

const MIN_GOAL = 1
const MAX_GOAL = 50
const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function isGoal(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= MIN_GOAL && (value as number) <= MAX_GOAL
}

// Скільки відгуків надіслано з понеділка цього тижня — і скільки лишилось до цілі.
// Ціль — особисте налаштування, тож живе в localStorage, а не в базі
export function WeeklyGoal({ applications, now }: WeeklyGoalProps) {
  const titleId = useId()
  const [goal, setGoal] = useLocalStorage('offerly:stats:weekly-goal', 10, isGoal)

  const weekStart = startOfWeek(now)
  const sent = applications.filter(
    (application) => application.status !== 'wishlist' && new Date(application.createdAt) >= weekStart,
  ).length
  const progress = Math.min(sent / goal, 1)
  const isDone = sent >= goal

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        <Target size={18} aria-hidden="true" />
        Ціль на тиждень
      </h2>

      <div className={styles.ring}>
        {/* Кільце прогресу: друге коло з пунктиром довжиною в усе коло; зсув пунктиру (dashoffset)
            "відкриває" лише частину, пропорційну прогресу */}
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className={styles.track} cx="60" cy="60" r={RADIUS} />
          <circle
            className={styles.value}
            cx="60"
            cy="60"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            data-done={isDone || undefined}
          />
        </svg>
        <p className={styles.count}>
          <strong>{sent}</strong>
          <span>з {goal}</span>
        </p>
      </div>

      <p className={styles.status} aria-live="polite">
        {isDone ? 'Ціль виконано — так тримати!' : `Ще ${goal - sent} до цілі цього тижня`}
      </p>

      <div className={styles.stepper} role="group" aria-label="Змінити ціль">
        <button
          type="button"
          aria-label="Зменшити ціль"
          disabled={goal <= MIN_GOAL}
          onClick={() => setGoal((value) => Math.max(MIN_GOAL, value - 1))}
        >
          <Minus size={14} />
        </button>
        <span>
          {goal} на тиждень
        </span>
        <button
          type="button"
          aria-label="Збільшити ціль"
          disabled={goal >= MAX_GOAL}
          onClick={() => setGoal((value) => Math.min(MAX_GOAL, value + 1))}
        >
          <Plus size={14} />
        </button>
      </div>
    </section>
  )
}
