import { LoaderCircle } from 'lucide-react'
import styles from './Spinner.module.css'

type SpinnerProps = {
  size?: number
}

// Декоративний: про стан завантаження скрінрідеру повідомляє текст або aria-busy поруч
export function Spinner({ size = 16 }: SpinnerProps) {
  return <LoaderCircle size={size} className={styles.spinner} aria-hidden="true" />
}
