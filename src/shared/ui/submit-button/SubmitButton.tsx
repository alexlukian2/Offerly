import type { ComponentProps, MouseEvent, ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/shared/ui/button'
import { Spinner } from '@/shared/ui/spinner'

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type' | 'children'> & {
  children: ReactNode
  pendingText: string
  // Якщо форма працює через onSubmit (а не action), стан відправки передають явно
  pending?: boolean
}

// Сама знає, чи відправляється форма, у якій вона стоїть, — без жодних props від батька.
// Під час відправки — aria-disabled, а не disabled: disabled забрав би з кнопки фокус,
// і користувач клавіатури чи скрінрідера "загубився" б на сторінці.
export function SubmitButton({
  children,
  pendingText,
  pending: pendingProp,
  onClick,
  ...rest
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus()
  const pending = pendingProp ?? formPending

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (pending) {
      event.preventDefault() // повторне натискання під час відправки ігноруємо
      return
    }
    onClick?.(event)
  }

  return (
    <Button
      type="submit"
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      onClick={handleClick}
      {...rest}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
