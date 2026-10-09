import { RotateCcw, TriangleAlert, WifiOff } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { SessionLost } from '@/features/board-key'
import { isSessionLostError } from '@/shared/api'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { getErrorMessage, isChunkLoadError, isNetworkError } from '@/shared/lib/errors'
import { Button, ButtonLink } from '@/shared/ui/button'
import styles from './RouteErrorPage.module.css'

type RouteErrorPageProps = {
  // inline — помилка всередині каркаса застосунку (сайдбар лишається), інакше — на весь екран
  inline?: boolean
}

function describe(error: unknown) {
  if (isChunkLoadError(error) || isNetworkError(error)) {
    return {
      icon: WifiOff,
      title: isNetworkError(error) ? 'Немає з’єднання з сервером' : 'Не вдалося завантажити сторінку',
      description: 'Схоже, зникло з’єднання з інтернетом. Перевір мережу й онови сторінку.',
    }
  }
  if (isRouteErrorResponse(error)) {
    return {
      icon: TriangleAlert,
      title: `Помилка ${error.status}`,
      description: error.statusText || 'Сервер відповів помилкою.',
    }
  }
  return {
    icon: TriangleAlert,
    title: 'Щось пішло не так',
    description: 'Сталася неочікувана помилка. Спробуй оновити сторінку — дані збережено.',
  }
}

export function RouteErrorPage({ inline = false }: RouteErrorPageProps) {
  const error = useRouteError()

  // Не збій, а окрема ситуація: браузер "забув" дошку. Пропонуємо ключ замість "Оновити сторінку"
  if (isSessionLostError(error)) return <SessionLost />

  const { icon: Icon, title, description } = describe(error)

  return (
    <div className={cn(styles.page, inline && styles.inline)} role="alert">
      <title>{`${title} — Offerly`}</title>
      <span className={styles.icon}>
        <Icon size={28} />
      </span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      <div className={styles.actions}>
        {/* Повне перезавантаження: заново завантажить і код, і дані зі сховища */}
        <Button onClick={() => window.location.reload()}>
          <RotateCcw size={16} />
          Оновити сторінку
        </Button>
        <ButtonLink href={inline ? ROUTES.board : ROUTES.home} variant="ghost">
          {inline ? 'До дошки' : 'На головну'}
        </ButtonLink>
      </div>

      {/* Технічні деталі — лише в режимі розробки: користувачу стек помилки нічого не скаже */}
      {import.meta.env.DEV && <pre className={styles.details}>{getErrorMessage(error)}</pre>}
    </div>
  )
}
