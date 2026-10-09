import { useEffect, useState } from 'react'
import { getNextReminderTime, type Application } from '@/entities/application'

const FALLBACK_TICK_MS = 60_000
// setTimeout приймає не більше ~24.8 доби (2^31 мс). Далі — просто перевіримо ще раз пізніше
const MAX_TIMEOUT_MS = 2 ** 31 - 1

// "Годинник" для нагадувань: повертає поточний час і оновлює його саме тоді, коли треба —
// у момент найближчого нагадування. Плюс запасний тік раз на хвилину і перерахунок,
// коли користувач повертається на вкладку (у фоні браузер "пригальмовує" таймери)
export function useReminderClock(applications: Application[]) {
  const [now, setNow] = useState(() => new Date())
  const next = getNextReminderTime(applications, now)
  const nextTime = next?.getTime() ?? null

  useEffect(() => {
    const refresh = () => setNow(new Date())

    const timers = [window.setInterval(refresh, FALLBACK_TICK_MS)]
    if (nextTime !== null) {
      const delay = Math.min(Math.max(nextTime - Date.now(), 0) + 250, MAX_TIMEOUT_MS)
      timers.push(window.setTimeout(refresh, delay))
    }
    document.addEventListener('visibilitychange', refresh)

    return () => {
      timers.forEach((id) => {
        window.clearInterval(id)
        window.clearTimeout(id)
      })
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [nextTime])

  return now
}
