import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers/AppProviders'
import { routes } from '@/app/router'

// Рендерить ВЕСЬ застосунок (ті самі провайдери й маршрути) на заданій адресі.
// Для інтеграційних тестів: "відкрив сторінку → клікнув → побачив результат"
export function renderApp(initialPath = '/app') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const user = userEvent.setup()
  // Новий кеш на кожен тест: дані одного тесту не "протікають" в інший. Без повторів — помилки одразу
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const result = render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  return { ...result, user, router, queryClient }
}
