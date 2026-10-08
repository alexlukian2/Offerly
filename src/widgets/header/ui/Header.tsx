import { Menu, X } from 'lucide-react'
import { useRef } from 'react'
import { ThemeSwitcher } from '@/features/switch-theme'
import { landingNavLinks } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
import { useClickOutside } from '@/shared/lib/use-click-outside'
import { useDisclosure } from '@/shared/lib/use-disclosure'
import { useEscapeKey } from '@/shared/lib/use-escape-key'
import { ButtonLink } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'
import styles from './Header.module.css'

export function Header() {
  const menu = useDisclosure()
  const headerRef = useRef<HTMLElement>(null)

  useEscapeKey(menu.close, { enabled: menu.isOpen })
  useClickOutside(headerRef, menu.close, { enabled: menu.isOpen })

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={cn('container', styles.inner)}>
        <Logo />

        <nav className={styles.nav} aria-label="Головна навігація">
          <ul>
            {landingNavLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ThemeSwitcher className={styles.desktopOnly} />
          <ButtonLink href="#signup">Спробувати</ButtonLink>

          <button
            type="button"
            className={styles.menuButton}
            aria-label={menu.isOpen ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={menu.isOpen}
            aria-controls="mobile-menu"
            onClick={menu.toggle}
          >
            {menu.isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menu.isOpen && (
        <nav id="mobile-menu" className={styles.mobileNav} aria-label="Мобільна навігація">
          <ul className="container">
            {landingNavLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={menu.close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={cn('container', styles.mobileTheme)}>
            <span>Тема</span>
            <ThemeSwitcher />
          </div>
        </nav>
      )}
    </header>
  )
}
