import { Check, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'
import { STATUS_COLORS, STATUS_LABELS } from '../model/labels'
import type { ApplicationStatus } from '../model/types'
import styles from './StageJourney.module.css'

const PATH: ApplicationStatus[] = ['wishlist', 'applied', 'test', 'interview', 'offer']

type StageJourneyProps = {
  status: ApplicationStatus
}

// Шлях вакансії етапами: пройдені — кольорові, поточний — пульсує, майбутні — бліді.
// Відмова: ми не знаємо, на якому етапі її отримали (історії немає), тож показуємо її
// замість наступного після "Відгукнувся" кроку — шлях обривається червоною точкою
export function StageJourney({ status }: StageJourneyProps) {
  const isRejected = status === 'rejected'
  const steps: ApplicationStatus[] = isRejected ? ['wishlist', 'applied', 'rejected'] : PATH
  const currentIndex = steps.indexOf(status)
  // Частка заповненої лінії: від першої точки до поточної
  const progress = currentIndex / (steps.length - 1)

  return (
    <ol
      className={styles.journey}
      style={{ '--progress': progress, '--count': steps.length } as CSSProperties}
      aria-label="Шлях вакансії етапами"
    >
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'future'
        return (
          <li
            key={step}
            className={cn(styles.step, styles[state])}
            style={{ '--stage': STATUS_COLORS[step], '--i': index } as CSSProperties}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.dot} aria-hidden="true">
              {state === 'done' && <Check size={12} />}
              {state === 'current' && step === 'rejected' && <X size={12} />}
              {state === 'current' && step === 'offer' && <Check size={12} />}
            </span>
            <span className={styles.label}>{STATUS_LABELS[step]}</span>
          </li>
        )
      })}
    </ol>
  )
}
