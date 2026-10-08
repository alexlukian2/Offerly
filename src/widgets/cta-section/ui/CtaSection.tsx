import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/shared/config/routes'
import { ButtonLink } from '@/shared/ui/button'
import styles from './CtaSection.module.css'

export function CtaSection() {
  return (
    <section id="signup" className="section">
      <div className="container">
        <div className={styles.card}>
          <h2 className={styles.title}>Готовий навести лад у пошуку роботи?</h2>
          <p className={styles.text}>
            Створи дошку за хвилину. Безкоштовно, без картки й зайвих питань.
          </p>
          <ButtonLink href={ROUTES.board} variant="inverse" size="lg">
            Створити дошку
            <ArrowRight size={18} />
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
