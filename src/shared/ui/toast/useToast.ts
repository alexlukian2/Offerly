import { useContext } from 'react'
import { ToastContext } from './toastContext'

export function useToast() {
  const showToast = useContext(ToastContext)

  if (showToast === null) {
    throw new Error('useToast має викликатися всередині <ToastProvider>')
  }

  return showToast
}
