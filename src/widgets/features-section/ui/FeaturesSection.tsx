import { SectionHeading } from '@/shared/ui/section-heading'
import { features } from '../model/features'
import { FeatureCard } from './FeatureCard'
import styles from './FeaturesSection.module.css'

export function FeaturesSection() {
  return (
    <section id="features" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Можливості"
          title="Пошук роботи під контролем"
          description="Усе, що зазвичай розкидано по таблицях, нотатках і закладках, — в одному місці."
        />

        <div className={styles.grid}>
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
