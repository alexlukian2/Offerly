import { useMutation } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { restoreBoard } from '@/shared/api'
import { getErrorMessage } from '@/shared/lib/errors'
import { Input } from '@/shared/ui/form'
import { SubmitButton } from '@/shared/ui/submit-button'
import styles from './BoardKey.module.css'

// Поле для ключа дошки. Після успішного входу перезавантажуємо сторінку:
// усі запити й кеш мають початися з нуля вже від імені "відновленого" користувача
export function RestoreBoardForm() {
  const id = useId()
  const [key, setKey] = useState('')
  const restore = useMutation({
    mutationFn: (value: string) => restoreBoard(value),
    onSuccess: () => window.location.assign('/app'),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!restore.isPending) restore.mutate(key)
  }

  return (
    <form className={styles.restore} onSubmit={handleSubmit} noValidate>
      <label htmlFor={id} className={styles.label}>
        <KeyRound size={16} aria-hidden="true" />
        Ключ дошки
      </label>
      <div className={styles.row}>
        <Input
          id={id}
          value={key}
          onChange={(event) => {
            setKey(event.target.value)
            if (restore.isError) restore.reset()
          }}
          placeholder="OFR-XXXXX-XXXXX-XXXXX-XXXXX"
          autoComplete="off"
          spellCheck={false}
          className={styles.keyInput}
          aria-invalid={restore.isError || undefined}
          aria-describedby={restore.isError ? `${id}-error` : undefined}
        />
        <SubmitButton pending={restore.isPending} pendingText="Відновлюємо…">
          Відновити
        </SubmitButton>
      </div>
      {restore.isError && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {getErrorMessage(restore.error)}
        </p>
      )}
    </form>
  )
}
