import { cn } from '@/shared/lib/cn'
import { Spinner } from '@/shared/ui/spinner'
import styles from './PageLoader.module.css'

type PageLoaderProps = {
  fullScreen?: boolean
}

export function PageLoader({ fullScreen = false }: PageLoaderProps) {
  return (
    // role="status": скрінрідер повідомить про завантаження, не перериваючи користувача
    <div className={cn(styles.loader, fullScreen && styles.fullScreen)} role="status">
      <Spinner size={28} />
      <span className="visually-hidden">Завантаження…</span>
    </div>
  )
}
