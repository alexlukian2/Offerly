import { KeyRound } from 'lucide-react'
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

        {/* Не крок, а порада: як не загубити дошку, поки немає входу через пошту */}
        <aside className={styles.tip} aria-labelledby="board-key-tip">
          <span className={styles.tipIcon} aria-hidden="true">
            <KeyRound size={22} />
          </span>
          <div>
            <h3 id="board-key-tip" className={styles.tipTitle}>
              Порада: збережи ключ дошки
            </h3>
            <p>
              Реєстрація не потрібна — дошка прив’язується до твого браузера. Щоб не загубити її після
              очищення кешу і відкрити на іншому пристрої, натисни «Ключ дошки» в меню застосунку і
              збережи ключ виду <code>OFR-XXXXX-…</code>. В іншому браузері вводиш його — і бачиш ту саму
              дошку.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
