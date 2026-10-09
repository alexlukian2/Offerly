import { useEffect, useState, type RefObject } from 'react'
import { STATUS_COLORS, STATUS_LABELS, type ApplicationStatus } from '@/entities/application'
import { cn } from '@/shared/lib/cn'
import styles from './StageTabs.module.css'

type StageTabsProps = {
  statuses: ApplicationStatus[]
  counts: Record<ApplicationStatus, number>
  // Контейнер дошки, що прокручується вбік. Колонки в ньому мають data-status
  boardRef: RefObject<HTMLDivElement | null>
}

// Телефон: на екрані видно одну колонку, тож над дошкою — ряд етапів з лічильниками.
// Натиснув — дошка прокрутилась до колонки; гортаєш дошку — підсвічується етап, що зараз на екрані
export function StageTabs({ statuses, counts, boardRef }: StageTabsProps) {
  const [current, setCurrent] = useState<ApplicationStatus | null>(statuses[0] ?? null)
  const statusesKey = statuses.join()

  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    // IntersectionObserver повідомляє, яка колонка видима більш ніж наполовину в межах дошки.
    // Без обробника scroll і підрахунку координат на кожен піксель прокрутки
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        const status = visible?.target.getAttribute('data-status') as ApplicationStatus | undefined
        if (status) setCurrent(status)
      },
      { root: board, threshold: 0.6 },
    )
    board.querySelectorAll('[data-status]').forEach((column) => observer.observe(column))
    return () => observer.disconnect()
    // statusesKey: перепідписатись, коли змінився набір колонок (сховали відмови, переставили)
  }, [boardRef, statusesKey])

  function scrollTo(status: ApplicationStatus) {
    const board = boardRef.current
    const column = board?.querySelector(`[data-status="${status}"]`)
    if (!board || !column) return
    const offset = column.getBoundingClientRect().left - board.getBoundingClientRect().left
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // 16px — внутрішній відступ дошки, щоб колонка стала рівно біля краю
    board.scrollBy({ left: offset - 16, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <nav className={styles.tabs} aria-label="Етапи">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          className={cn(styles.tab, current === status && styles.current)}
          aria-current={current === status || undefined}
          onClick={() => scrollTo(status)}
        >
          <span className={styles.dot} style={{ backgroundColor: STATUS_COLORS[status] }} />
          {STATUS_LABELS[status]}
          <span className={styles.count}>{counts[status]}</span>
        </button>
      ))}
    </nav>
  )
}
