import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  applicationKeys,
  updateApplicationStatus,
  type Application,
  type ApplicationStatus,
} from '@/entities/application'
import { launchConfetti } from '@/shared/lib/confetti'
import { isNetworkError } from '@/shared/lib/errors'
import { useToast } from '@/shared/ui/toast'

type MoveVariables = {
  application: Application
  status: ApplicationStatus
}

// Ключ мутації: за ним можна дізнатися, скільки переміщень ще в процесі
const moveMutationKey = [...applicationKeys.all, 'move'] as const

// Оптимістичне оновлення "по-бібліотечному": змінюємо кеш одразу, відкочуємо при помилці
export function useMoveApplication() {
  const queryClient = useQueryClient()
  const showToast = useToast()

  const { mutate, isPending } = useMutation({
    mutationKey: moveMutationKey,
    mutationFn: ({ application, status }: MoveVariables) =>
      updateApplicationStatus(application.id, status),

    // 1. ДО запиту: показуємо результат одразу
    onMutate: async ({ application, status }) => {
      // Скасовуємо фонові перезавантаження списку — щоб стара відповідь сервера не "перезаписала" нашу зміну
      await queryClient.cancelQueries({ queryKey: applicationKeys.all })

      const previous = queryClient.getQueryData<Application[]>(applicationKeys.all)
      queryClient.setQueryData<Application[]>(applicationKeys.all, (current) =>
        current?.map((item) => (item.id === application.id ? { ...item, status } : item)),
      )

      return { previous } // знімок "до" — для відкату
    },

    // 2. Помилка: повертаємо знімок і пояснюємо, що сталося
    onError: (error, { application }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(applicationKeys.all, context.previous)
      }
      showToast({
        variant: 'error',
        message: isNetworkError(error)
          ? `Не вдалося перемістити «${application.company}»: немає з’єднання`
          : `Не вдалося перемістити «${application.company}». Спробуй ще раз`,
      })
    },

    // Офер — подія, яку варто відсвяткувати. Після підтвердження сервера, а не оптимістично:
    // конфеті на переміщенні, яке потім відкотилося б, було б дивним
    onSuccess: (_, { application, status }) => {
      if (status === 'offer') {
        launchConfetti()
        showToast({ message: `Офер від «${application.company}» — вітаємо! 🎉` })
      }
    },

    // 3. Завжди: звіряємось із сервером. Але лише коли завершилось ОСТАННЄ з переміщень, що йдуть паралельно,
    //    інакше відповідь на перше перезаписала б оптимістичний стан другого
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: moveMutationKey }) === 1) {
        return queryClient.invalidateQueries({ queryKey: applicationKeys.all })
      }
    },
  })

  const move = useCallback(
    (application: Application, status: ApplicationStatus) => mutate({ application, status }),
    [mutate],
  )

  return { move, isPending }
}
