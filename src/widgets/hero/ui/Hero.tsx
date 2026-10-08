import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { ButtonLink } from '@/shared/ui/button'
import { BoardPreview } from './BoardPreview'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={cn('container', styles.inner)}>
        <div className={styles.content}>
          <p className={styles.badge}>
            <span className={styles.badgeDot} />
            Для розробників, які шукають роботу
          </p>

          <h1 className={styles.title}>
            Від першого відгуку — <span className={styles.accent}>до оферу</span>
          </h1>

          <p className={styles.subtitle}>
            Offerly збирає всі вакансії, на які ти відгукнувся, на одній дошці.
            Статуси, нотатки, дати співбесід і статистика — замість хаосу в таблицях.
          </p>

          <div className={styles.actions}>
            <ButtonLink href={ROUTES.board} size="lg">
              Почати безкоштовно
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="#how-it-works" variant="ghost" size="lg">
              Як це працює
            </ButtonLink>
          </div>

          <p className={styles.note}>Безкоштовно · Open source · Твої дані належать тобі</p>
        </div>

        <BoardPreview />
      </div>
    </section>
  )
}
