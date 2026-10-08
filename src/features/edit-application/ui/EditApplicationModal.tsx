import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  applicationKeys,
  ApplicationForm,
  toFormValues,
  updateApplication,
  type Application,
  type ApplicationInput,
} from '@/entities/application'
import { Modal } from '@/shared/ui/modal'

type EditApplicationModalProps = {
  application: Application
  onClose: () => void
  extraActions?: ReactNode
}

export function EditApplicationModal({
  application,
  onClose,
  extraActions,
}: EditApplicationModalProps) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (input: ApplicationInput) => updateApplication(application.id, input),
    onSuccess: (result) => {
      if (result.ok) return queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })

  async function handleSubmit(input: ApplicationInput) {
    const result = await mutateAsync(input)
    if (!result.ok) return result.errors
    onClose()
  }

  return (
    <Modal title="Редагувати вакансію" onClose={onClose}>
      <ApplicationForm
        initialValues={toFormValues(application)}
        submitLabel="Зберегти"
        pendingText="Зберігаємо…"
        onSubmit={handleSubmit}
        onCancel={onClose}
        extraActions={extraActions}
      />
    </Modal>
  )
}
