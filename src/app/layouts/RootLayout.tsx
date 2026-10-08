import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { PageLoader } from '@/shared/ui/page-loader'

export function RootLayout() {
  return (
    <>
      {/* Поки вантажиться код сторінки (лендінг, каркас застосунку, 404) — показуємо loader */}
      <Suspense fallback={<PageLoader fullScreen />}>
        <Outlet />
      </Suspense>
      <ScrollRestoration />
    </>
  )
}
