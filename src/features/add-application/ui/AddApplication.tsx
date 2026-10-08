import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import {
  applicationKeys,
  ApplicationForm,
  createApplication,
  type ApplicationInput,
} from '@/entities/application'
import { useDisclosure } from '@/shared/lib/use-disclosure'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'
import { VacancyAutofill } from './VacancyAutofill'

export function AddApplication() {
  const queryClient = useQueryClient()
  const { isOpen, open, close } = useDisclosure()

  const { mutateAsync } = useMutation({
    // Явна обгортка: TanStack Query v5 передає в mutationFn ДРУГИМ аргументом свій службовий context.
    // Передавши createApplication напряму, ми б непомітно віддали йому зайвий аргумент
    mutationFn: (input: ApplicationInput) => createApplication(input),
    // Після успішного створення кеш списку застарів → позначаємо його "несвіжим", і він перезавантажиться.
    // Повертаємо Promise: mutateAsync дочекається оновленого списку, і модалка закриється вже з новою карткою
    onSuccess: (result) => {
      if (result.ok) return queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })

  async function handleSubmit(input: ApplicationInput) {
    const result = await mutateAsync(input)
    if (!result.ok) return result.errors // "серверна" помилка (дублікат) — покаже форма
    close()
  }

  return (
    <>
      <Button onClick={open}>
        <Plus size={18} />
        Додати вакансію
      </Button>

      {isOpen && (
        <Modal title="Нова вакансія" onClose={close}>
          <ApplicationForm
            submitLabel="Додати вакансію"
            pendingText="Додаємо…"
            onSubmit={handleSubmit}
            onCancel={close}
            renderAutofill={(fill) => <VacancyAutofill onFill={fill} />}
          />
        </Modal>
      )}
    </>
  )
}
