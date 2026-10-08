import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  applicationKeys,
  applicationsReducer,
  updateApplicationStatus,
  type Application,
  type ApplicationStatus,
} from '@/entities/application'
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
      // Той самий reducer, що й у тестах та уроці 8: одна логіка зміни списку
      queryClient.setQueryData<Application[]>(applicationKeys.all, (current) =>
        current && applicationsReducer(current, { type: 'moved', id: application.id, status }),
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
