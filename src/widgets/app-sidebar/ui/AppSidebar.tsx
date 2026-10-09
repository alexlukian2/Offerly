import { ArrowLeft, ChartColumn, SquareKanban } from 'lucide-react'
import { Link, NavLink, useMatch } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { applicationsQueryOptions } from '@/entities/application'
import { ThemeSwitcher } from '@/features/switch-theme'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { Logo } from '@/shared/ui/logo'
import styles from './AppSidebar.module.css'

const appNavLinks = [
  { to: ROUTES.board, label: 'Дошка', icon: SquareKanban, showCount: true },
  { to: ROUTES.stats, label: 'Статистика', icon: ChartColumn, showCount: false },
]

export function AppSidebar() {
  // Звичайний (не Suspense) запит: сайдбар не має чекати даних — лічильник з'явиться, щойно вони прийдуть.
  // Той самий ключ, що й у дошки, тож це не другий запит, а читання того самого кешу
  const { data: applications } = useQuery(applicationsQueryOptions)
  // Сторінка вакансії — частина розділу «Дошка», тож підсвічуємо його і там
  const isApplicationPage = useMatch(ROUTES.applicationDetails) !== null

  return (
    <aside className={styles.sidebar}>
      <Logo />

      <nav className={styles.nav} aria-label="Навігація застосунку">
        <ul>
          {appNavLinks.map(({ to, label, icon: Icon, showCount }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    styles.link,
                    (isActive || (to === ROUTES.board && isApplicationPage)) && styles.active,
                  )
                }
              >
                {/* Іконка-плитка: у активного розділу — голографічна */}
                <span className={styles.tile} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span>{label}</span>
                {showCount && applications && (
                  <span className={styles.count}>{applications.length}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <ThemeSwitcher variant="labeled" className={styles.theme} />
        <ThemeSwitcher className={styles.themeCompact} />
        {/* На телефоні — лише іконка (текст схований CSS), тож назву для скрінрідера даємо через aria-label */}
        <Link to={ROUTES.home} className={styles.back} aria-label="На головну">
          <ArrowLeft size={16} aria-hidden="true" />
          <span className={styles.backLabel} aria-hidden="true">
            На головну
          </span>
        </Link>
      </div>
    </aside>
  )
}
