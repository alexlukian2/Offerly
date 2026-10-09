import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 900

// Число "набігає" від того, що зараз на екрані, до нового значення (ease-out).
// Перший показ — від 0. Якщо користувач вимкнув анімації в ОС — одразу кінцеве значення.
// setState викликаємо лише в колбеку requestAnimationFrame, не в тілі ефекту (урок 10)
export function useCountUp(target: number) {
  const [value, setValue] = useState(0)
  // Що зараз показано — ref, бо це не впливає на рендер, а потрібне як точка старту
  const shownRef = useRef(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = shownRef.current
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = reduceMotion ? 1 : Math.min((now - start) / DURATION_MS, 1)
      const eased = 1 - (1 - t) ** 3
      const next = Math.round(from + (target - from) * eased)
      shownRef.current = next
      setValue(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return value
}
