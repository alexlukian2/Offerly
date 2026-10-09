import { X } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'
import { getFocusableElements } from '@/shared/lib/dom'
import { useEscapeKey } from '@/shared/lib/use-escape-key'
import { IconButton } from '@/shared/ui/icon-button'
import { isTopModal, registerModal, unregisterModal } from './modalStack'
import styles from './Modal.module.css'

type ModalProps = {
  title: string
  onClose: () => void
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Modal({ title, onClose, size = 'md', children }: ModalProps) {
  // useId — стабільний і унікальний для кожного екземпляра: годиться і як id модалки в стеку
  const modalId = useId()
  const titleId = `${modalId}-title`

  const dialogRef = useRef<HTMLDivElement>(null)
  // Ref на значення: де почалося натискання миші. Ререндер для цього не потрібен
  const mouseDownTargetRef = useRef<EventTarget | null>(null)

  useEffect(() => {
    registerModal(modalId)
    return () => unregisterModal(modalId)
  }, [modalId])

  // Фокус: при відкритті — всередину модалки, при закритті — туди, де був
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const initialFocus =
      dialog.querySelector<HTMLElement>('[data-autofocus]') ??
      getFocusableElements(dialog)[0] ??
      dialog
    initialFocus.focus()

    return () => {
      // Елемент міг зникнути (наприклад, картку видалили) — тоді фокус не повертаємо
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [])

  useEscapeKey(() => {
    if (isTopModal(modalId)) {
      onClose()
    }
  })

  // "Пастка фокусу": Tab і Shift+Tab ходять по колу всередині модалки
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const dialog = dialogRef.current
    if (event.key !== 'Tab' || !dialog || !isTopModal(modalId)) return

    const focusable = getFocusableElements(dialog)
    const first = focusable[0]
    const last = focusable.at(-1)
    const active = document.activeElement

    if (!first || !last) {
      event.preventDefault()
      return
    }

    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>) {
    mouseDownTargetRef.current = event.target
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    // Закриваємо, лише якщо І натиснули, І відпустили саме на фоні.
    // Інакше виділення тексту в полі з відпусканням миші на фоні закрило б модалку.
    const startedOnOverlay = mouseDownTargetRef.current === event.currentTarget
    if (startedOnOverlay && event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(styles.dialog, styles[size])}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton label="Закрити" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
