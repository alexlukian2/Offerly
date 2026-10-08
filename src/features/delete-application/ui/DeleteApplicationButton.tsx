import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { applicationKeys, deleteApplication, type Application } from '@/entities/application'
import { isNetworkError } from '@/shared/lib/errors'
import { useDisclosure } from '@/shared/lib/use-disclosure'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { useToast } from '@/shared/ui/toast'

type DeleteApplicationButtonProps = {
  application: Application
  onDeleted?: () => void
}

export function DeleteApplicationButton({ application, onDeleted }: DeleteApplicationButtonProps) {
  const queryClient = useQueryClient()
  const confirm = useDisclosure()
  const showToast = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteApplication(application.id),
    onSuccess: () => {
      // Замість повторного запиту — самі прибираємо вакансію з кешу: ми точно знаємо, що змінилось
      queryClient.setQueryData(applicationKeys.all, (current: Application[] | undefined) =>
        current?.filter((item) => item.id !== application.id),
      )
      showToast({ message: `Вакансію «${application.company}» видалено` })
      onDeleted?.()
    },
    onError: (error) => {
      showToast({
        variant: 'error',
        message: isNetworkError(error)
          ? 'Не вдалося видалити: немає з’єднання'
          : 'Не вдалося видалити вакансію. Спробуй ще раз',
      })
    },
  })

  return (
    <>
      <Button variant="dangerSoft" onClick={confirm.open}>
        <Trash2 size={16} />
        Видалити
      </Button>

      {confirm.isOpen && (
        <ConfirmDialog
          title="Видалити вакансію?"
          description={`Вакансію «${application.company}» буде видалено з дошки. Цю дію не можна скасувати.`}
          confirmLabel="Видалити"
          pendingLabel="Видаляємо…"
          isPending={isPending}
          onConfirm={() => mutate()}
          onCancel={confirm.close}
        />
      )}
    </>
  )
}
