import { createContext } from 'react'

export type ToastVariant = 'success' | 'error'

export type ToastOptions = {
  message: string
  variant?: ToastVariant
}

export const ToastContext = createContext<((options: ToastOptions) => void) | null>(null)
