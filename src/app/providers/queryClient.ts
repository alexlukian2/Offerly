import { QueryClient } from '@tanstack/react-query'
import { isNetworkError } from '@/shared/lib/errors'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 30 с дані вважаються "свіжими": повторний перехід на сторінку не робить новий запит
        staleTime: 30_000,
        // Повторюємо лише мережеві збої (до 2 разів, із зростаючою паузою). Помилка в даних не мине від повтору
        retry: (failureCount, error) => isNetworkError(error) && failureCount < 2,
        // 'always': запит виконується навіть офлайн і падає з NetworkError — інтерфейс показує помилку
        // (за замовчуванням TanStack Query ставить такі запити на паузу)
        networkMode: 'always',
      },
      mutations: {
        retry: false,
        networkMode: 'always',
      },
    },
  })
}
