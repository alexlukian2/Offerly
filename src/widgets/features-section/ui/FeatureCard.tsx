import type { Feature } from '../model/features'
import styles from './FeatureCard.module.css'

type FeatureCardProps = Omit<Feature, 'id'>

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.icon}>
        <Icon size={22} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
