import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/shared/config/routes'
import { ButtonLink } from '@/shared/ui/button'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <title>Сторінку не знайдено — Offerly</title>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Такої сторінки немає</h1>
      <p className={styles.text}>
        Можливо, посилання застаріло або в адресі помилка. Як і з вакансіями — буває.
      </p>
      <ButtonLink href={ROUTES.home} size="lg">
        <ArrowLeft size={18} />
        На головну
      </ButtonLink>
    </main>
  )
}
