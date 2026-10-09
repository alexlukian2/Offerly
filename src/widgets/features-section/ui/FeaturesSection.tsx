import { cn } from '@/shared/lib/cn'
import { FloatingShapes } from '@/shared/ui/floating-shapes'
import { SectionHeading } from '@/shared/ui/section-heading'
import { features } from '../model/features'
import { FeatureCard } from './FeatureCard'
import styles from './FeaturesSection.module.css'

export function FeaturesSection() {
  return (
    <section id="features" className={cn('section', styles.section)}>
      <FloatingShapes variant="section" />
      <div className="container">
        <SectionHeading
          eyebrow="Можливості"
          title="Менше хаосу — більше результату"
          description="Усе, що зазвичай розкидано по таблицях, закладках і чатах, — на одній зручній дошці."
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
