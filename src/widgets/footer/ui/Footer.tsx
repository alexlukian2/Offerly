import { REPOSITORY_URL } from '@/shared/config/links'
import { landingNavLinks } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
import { GithubMark } from '@/shared/ui/github-mark'
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

        {/* Відкритий код — підтвердження словам "open source" на сайті: репозиторій і ліцензія MIT */}
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className={styles.repo}>
          <GithubMark size={16} />
          Open source · GitHub
          <span className={styles.license}>MIT</span>
        </a>

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
