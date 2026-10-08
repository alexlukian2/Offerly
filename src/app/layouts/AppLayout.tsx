import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { PageLoader } from '@/shared/ui/page-loader'
import { AppSidebar } from '@/widgets/app-sidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <AppSidebar />
      <main className={styles.content}>
        {/* Окремий Suspense всередині: при переході між сторінками застосунку
            сайдбар лишається на місці, а loader з'являється лише в області контенту */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
