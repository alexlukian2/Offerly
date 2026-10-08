import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
import { ThemeProvider } from '@/features/switch-theme'
import { ToastProvider } from '@/shared/ui/toast'
import { createQueryClient } from './queryClient'

type AppProvidersProps = {
  children: ReactNode
  // Тести передають власний клієнт (без повторів) — щоб кожен тест мав чистий кеш
  queryClient?: QueryClient
}

// Усі глобальні провайдери застосунку — в одному місці
export function AppProviders({ children, queryClient: providedClient }: AppProvidersProps) {
  // Клієнт (і його кеш) створюється ОДИН раз на весь час життя застосунку (ліниве значення, урок 10.7)
  const [queryClient] = useState(() => providedClient ?? createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
      {/* Інструмент розробника: кнопка в куті екрана показує вміст кешу. У продакшн-збірку не потрапляє */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}
