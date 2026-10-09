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
  // Клієнт (і його кеш) створюється ОДИН раз на весь час життя застосунку
  const [queryClient] = useState(() => providedClient ?? createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
      {/* Кеш запитів — лише в режимі розробки. Справа, щоб не перекривати сайдбар */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
