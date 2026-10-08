import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'
import { Spinner } from '@/shared/ui/spinner'
import styles from './ConfirmDialog.module.css'

type ConfirmDialogProps = {
  title: string
  description: string
  confirmLabel: string
  pendingLabel?: string
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  pendingLabel = confirmLabel,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel} data-autofocus>
          Скасувати
        </Button>
        {/* aria-disabled, а не disabled — щоб кнопка не втратила фокус під час очікування (урок 16.9) */}
        <Button
          variant="danger"
          aria-disabled={isPending || undefined}
          aria-busy={isPending || undefined}
          onClick={() => {
            if (!isPending) onConfirm()
          }}
        >
          {isPending && <Spinner />}
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
