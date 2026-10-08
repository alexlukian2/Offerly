import { Briefcase } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/shared/config/routes'
import styles from './Logo.module.css'

export function Logo() {
  return (
    <Link to={ROUTES.home} className={styles.logo}>
      <span className={styles.mark}>
        <Briefcase size={18} strokeWidth={2.5} />
      </span>
      Offerly
    </Link>
  )
}
