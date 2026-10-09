import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BellRing, Check, Clock } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  applicationKeys,
  applicationsQueryOptions,
  formatReminder,
  getDueReminders,
  updateApplicationReminder,
  type Application,
} from '@/entities/application'
import { getApplicationPath } from '@/shared/config/routes'
import { showBrowserNotification } from '@/shared/lib/browser-notifications'
import { isNetworkError } from '@/shared/lib/errors'
import { useToast } from '@/shared/ui/toast'
import { useReminderClock } from '../model/useReminderClock'
import styles from './ReminderCenter.module.css'

const MAX_VISIBLE = 3
const HOUR_MS = 3_600_000

function tomorrowAtTen(now: Date) {
  const date = new Date(now)
  date.setDate(date.getDate() + 1)
  date.setHours(10, 0, 0, 0)
  return date
}

// Стопка нагадувань, що настали, — у кутку екрана на всіх сторінках застосунку (AppLayout).
// На відміну від тостів, сама не зникає: нагадування закриває лише користувач
export function ReminderCenter() {
  const queryClient = useQueryClient()
  const showToast = useToast()
  const navigate = useNavigate()
  // Звичайний (не Suspense) запит — той самий кеш, що й у дошки; поки даних немає — нічого не показуємо
  const { data: applications = [] } = useQuery(applicationsQueryOptions)
  const now = useReminderClock(applications)
  const due = getDueReminders(applications, now)

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, remindAt }: { id: string; remindAt: string | null }) =>
      updateApplicationReminder(id, remindAt),
    onSuccess: (updated) => {
      queryClient.setQueryData(applicationKeys.all, (current: Application[] | undefined) =>
        current?.map((item) => (item.id === updated.id ? updated : item)),
      )
    },
    onError: (error) =>
      showToast({
        variant: 'error',
        message: isNetworkError(error) ? 'Немає з’єднання — спробуй ще раз' : 'Не вдалося оновити нагадування',
      }),
  })

  // Системне сповіщення — лише якщо вкладка у фоні (на видимій сторінці вистачає картки)
  // і лише раз на кожне нагадування. Ключ = id + час: відклав — це вже нове нагадування
  const notified = useRef(new Set<string>())
  useEffect(() => {
    for (const application of due) {
      const key = `${application.id}:${application.remindAt}`
      if (notified.current.has(key)) continue
      notified.current.add(key)
      if (document.visibilityState === 'hidden') {
        showBrowserNotification(`Нагадування: ${application.company}`, {
          body: application.remindNote ?? application.position,
          tag: application.id,
          onClick: () => navigate(getApplicationPath(application.id)),
        })
      }
    }
  }, [due, navigate])

  if (due.length === 0) return null

  const visible = due.slice(0, MAX_VISIBLE)

  return (
    // region + aria-live: скрінрідер оголосить нове нагадування, щойно воно з'явиться
    <section className={styles.center} aria-label="Нагадування" aria-live="polite">
      {visible.map((application) => (
        <article key={application.id} className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            <BellRing size={18} />
          </span>
          <div className={styles.body}>
            <p className={styles.time}>{formatReminder(application.remindAt!, now)}</p>
            <h2 className={styles.title}>
              <Link to={getApplicationPath(application.id)}>{application.company}</Link>
            </h2>
            <p className={styles.note}>{application.remindNote ?? application.position}</p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primary}
                disabled={isPending}
                onClick={() => mutate({ id: application.id, remindAt: null })}
              >
                <Check size={14} aria-hidden="true" />
                Готово
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={isPending}
                // Короткий підпис — для очей, повна назва — для скрінрідера (aria-label замінює текст)
                aria-label="Відкласти на годину"
                onClick={() =>
                  mutate({ id: application.id, remindAt: new Date(Date.now() + HOUR_MS).toISOString() })
                }
              >
                <Clock size={14} aria-hidden="true" />
                +1 год
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={isPending}
                aria-label="Відкласти до завтра, 10:00"
                onClick={() =>
                  mutate({ id: application.id, remindAt: tomorrowAtTen(new Date()).toISOString() })
                }
              >
                Завтра
              </button>
            </div>
          </div>
        </article>
      ))}
      {due.length > MAX_VISIBLE && (
        <p className={styles.more}>І ще {due.length - MAX_VISIBLE} — закрий ці, щоб побачити</p>
      )}
    </section>
  )
}
