import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import styles from './FaqItem.module.css'

type FaqItemProps = {
  id: string
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

export function FaqItem({ id, question, answer, isOpen, onToggle }: FaqItemProps) {
  const buttonId = `faq-${id}-button`
  const panelId = `faq-${id}-panel`

  return (
    <div className={cn(styles.item, isOpen && styles.open)}>
      <h3 className={styles.heading}>
        <button
          id={buttonId}
          type="button"
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          {question}
          <ChevronDown className={styles.chevron} size={20} />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={styles.panel}
        inert={!isOpen}
      >
        <div className={styles.panelInner}>
          <p className={styles.answer}>{answer}</p>
        </div>
      </div>
    </div>
  )
}
