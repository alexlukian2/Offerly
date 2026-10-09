import { cn } from '@/shared/lib/cn'
import { FloatingShapes } from '@/shared/ui/floating-shapes'
import { SectionHeading } from '@/shared/ui/section-heading'
import { steps } from '../model/steps'
import styles from './HowItWorks.module.css'

export function HowItWorks() {
  return (
    <section id="how-it-works" className={cn('section', styles.section)}>
      <FloatingShapes variant="section" />
      <div className="container">
        <SectionHeading
          eyebrow="Як це працює"
          title="Три кроки до продуктивності"
          description="Жодних налаштувань: відкрив дошку — і вже працюєш."
        />

        <ol className={styles.steps}>
          {steps.map(({ id, icon: Icon, title, description }, index) => (
            <li key={id} className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.icon}>
                  <Icon size={22} />
                </span>
                <span className={styles.number}>Крок {index + 1}</span>
              </div>
              <h3 className={styles.title}>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
