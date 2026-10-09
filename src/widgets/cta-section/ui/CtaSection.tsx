import { ArrowRight, Check } from 'lucide-react'
import type { PointerEvent } from 'react'
import { ROUTES } from '@/shared/config/routes'
import { ButtonLink } from '@/shared/ui/button'
import styles from './CtaSection.module.css'

// Лише те, що справді працює вже зараз: анонімний вхід, RLS по користувачу, без оплати
const PERKS = ['Без реєстрації', 'Дані бачиш лише ти', 'Безкоштовно']

// Позиція курсора → CSS-змінні картки. Без useState: інакше React перерендерював би секцію
// десятки разів на секунду. Рух і плавність повністю на боці CSS (див. @property у стилях)
function moveSpotlight(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== 'mouse') return // на сенсорному екрані "курсора" немає
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
  card.style.setProperty('--spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
}

export function CtaSection() {
  return (
    <section id="signup" className="section">
      <div className="container">
        <div className={styles.card} onPointerMove={moveSpotlight}>
          {/* Декоративні шари світла: пляма на фоні й підсвічена ділянка рамки */}
          <span className={styles.spotlight} aria-hidden="true" />
          <span className={styles.border} aria-hidden="true" />

          <p className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            Старт за 10 секунд
          </p>

          <h2 className={styles.title}>
            {/* \u00A0 — нерозривний пробіл: однолітерне "у" не лишиться в кінці рядка */}
            Готовий навести <span className={styles.accent}>лад</span> у{'\u00A0'}пошуку роботи?
          </h2>
          <p className={styles.text}>
            Відкрий дошку — і додай першу вакансію. Без форм реєстрації, карток і зайвих питань.
          </p>

          <ButtonLink href={ROUTES.board} variant="inverse" size="lg" className={styles.button}>
            Створити дошку
            <ArrowRight size={18} className={styles.arrow} />
          </ButtonLink>

          <ul className={styles.perks}>
            {PERKS.map((perk) => (
              <li key={perk}>
                <Check size={14} aria-hidden="true" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
