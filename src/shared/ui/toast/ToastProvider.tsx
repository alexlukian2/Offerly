import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'
import { ToastContext, type ToastOptions, type ToastVariant } from './toastContext'
import styles from './Toast.module.css'

const TOAST_DURATION_MS = 5000
const MAX_TOASTS = 3

type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  // Стабільна функція (useCallback з порожніми залежностями): контекст із нею ніколи не змінюється,
  // тож компоненти, які лише показують сповіщення, не перерендерюються, коли з'являються нові
  const show = useCallback(({ message, variant = 'success' }: ToastOptions) => {
    const toast = { id: crypto.randomUUID(), message, variant }
    setToasts((current) => [...current, toast].slice(-MAX_TOASTS))
  }, [])

  return (
    <ToastContext value={show}>
      {children}
      {createPortal(
        // Регіон існує ЗАВЖДИ: скрінрідер оголошує зміни лише в наявному live-регіоні
        <div className={styles.viewport} role="region" aria-label="Сповіщення" aria-live="polite">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext>
  )
}

type ToastItemProps = {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  // Кожне сповіщення само прибирає себе через 5 секунд; cleanup скасовує таймер,
  // якщо його закрили раніше вручну
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const Icon = toast.variant === 'error' ? CircleAlert : CircleCheck

  return (
    <div
      className={cn(styles.toast, styles[toast.variant])}
      // Помилка — role="alert": скрінрідер перерве поточне читання й оголосить одразу
      role={toast.variant === 'error' ? 'alert' : undefined}
    >
      <Icon size={20} className={styles.icon} aria-hidden="true" />
      <p className={styles.message}>{toast.message}</p>
      <button
        type="button"
        className={styles.close}
        onClick={() => onDismiss(toast.id)}
        aria-label="Закрити сповіщення"
      >
        <X size={16} />
      </button>
    </div>
  )
}
