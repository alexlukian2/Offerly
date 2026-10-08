import { landingNavLinks } from '@/shared/config/navigation'
import { Logo } from '@/shared/ui/logo'
import styles from './Footer.module.css'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p className={styles.tagline}>
              Трекер пошуку роботи для розробників. Від першого відгуку — до оферу.
            </p>
          </div>

          <nav aria-label="Навігація у футері">
            <ul className={styles.links}>
              {landingNavLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className={styles.copyright}>© {currentYear} Offerly. Усі права захищено.</p>
      </div>
    </footer>
  )
}
