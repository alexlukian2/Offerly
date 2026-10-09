import { landingNavLinks } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
import { Logo } from '@/shared/ui/logo'
import styles from './Footer.module.css'

const currentYear = new Date().getFullYear()

// Мінімалістичний футер в один рядок: бренд і рік — зліва, навігація — справа.
// Шапка й CTA вище вже все розповіли, тож тут нічого не повторюємо
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={cn('container', styles.inner)}>
        <div className={styles.brand}>
          <Logo />
          <span className={styles.year}>© {currentYear}</span>
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
    </footer>
  )
}
