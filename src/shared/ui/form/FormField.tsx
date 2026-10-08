import type { ReactNode } from 'react'
import styles from './Form.module.css'
import { getErrorId } from './getErrorId'

type FormFieldProps = {
  label: string
  htmlFor: string
  error?: string
  optional?: boolean
  children: ReactNode
}

export function FormField({ label, htmlFor, error, optional, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}>необов’язково</span>}
      </label>
      {children}
      {error && (
        <p id={getErrorId(htmlFor)} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
