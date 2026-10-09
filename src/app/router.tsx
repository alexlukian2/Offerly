import { createBrowserRouter, type RouteObject } from 'react-router'
// Сторінка помилки — НЕ lazy: вона має працювати навіть тоді, коли не вдалося завантажити інший код
import { RouteErrorPage } from '@/pages/route-error'
import { ROUTES } from '@/shared/config/routes'
import { lazyNamed } from '@/shared/lib/lazy-named'
import { RootLayout } from './layouts/RootLayout'

// Кожен import() — окремий файл (chunk) у збірці. Він завантажиться лише тоді,
// коли React вперше спробує відрендерити відповідний компонент.
// Оголошуємо на рівні модуля, а не всередині компонента: інакше кожен рендер створював би новий lazy-компонент.
const LandingPage = lazyNamed(() => import('@/pages/landing'), 'LandingPage')
const AppLayout = lazyNamed(() => import('./layouts/AppLayout'), 'AppLayout')
const BoardPage = lazyNamed(() => import('@/pages/board'), 'BoardPage')
const StatsPage = lazyNamed(() => import('@/pages/stats'), 'StatsPage')
const ApplicationDetailsPage = lazyNamed(
  () => import('@/pages/application-details'),
  'ApplicationDetailsPage',
)
const SharedPage = lazyNamed(() => import('@/pages/shared'), 'SharedPage')
const NotFoundPage = lazyNamed(() => import('@/pages/not-found'), 'NotFoundPage')

// Маршрути окремо від роутера: застосунок створює з них BrowserRouter (справжня адреса),
// а тести — MemoryRouter (адреса в пам'яті, без вікна браузера)
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: ROUTES.home,
        element: <LandingPage />,
      },
      {
        path: ROUTES.board,
        element: <AppLayout />,
        children: [
          {
            // Маршрут без path: лише межа помилок для сторінок застосунку.
            // Помилка в сторінці покаже RouteErrorPage всередині AppLayout — сайдбар лишиться
            errorElement: <RouteErrorPage inline />,
            children: [
              { index: true, element: <BoardPage /> },
              { path: ROUTES.stats, element: <StatsPage /> },
              { path: ROUTES.applicationDetails, element: <ApplicationDetailsPage /> },
            ],
          },
        ],
      },
      {
        // Поза AppLayout: гостю не потрібні сайдбар, вхід і чужа навігація
        path: ROUTES.shared,
        element: <SharedPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
