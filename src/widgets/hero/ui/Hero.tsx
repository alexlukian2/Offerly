import { ArrowRight, BellRing, Check, PartyPopper } from 'lucide-react'
import type { CSSProperties } from 'react'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { ButtonLink } from '@/shared/ui/button'
import { FloatingShapes } from '@/shared/ui/floating-shapes'
import { Sparkline } from '@/shared/ui/micro-charts'
import { BoardPreview } from './BoardPreview'
import styles from './Hero.module.css'

const BRAND = 'Offerly'

// Лише те, що справді вже працює в застосунку
const HIGHLIGHTS = [
  'Без реєстрації',
  'Канбан-дошка етапів',
  'Нагадування',
  'Статистика і календар',
  'Нотатки у клітинку',
  'Автозаповнення за посиланням',
  'Поділитися дошкою',
]

// Приклад для "плаваючої" картки — не дані користувача
const SAMPLE_WEEK = [1, 3, 2, 4, 3, 6, 5]

export function Hero() {
  return (
    <section className={styles.hero}>
      <FloatingShapes variant="hero" />

      <div className={cn('container', styles.inner)}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true">✦</span> Безкоштовно · Open source
          </p>

          {/* Назва — головний герой: кожна літера окремо, щоб "підстрибувала" своєю хвилею.
              Для скрінрідера — звичайне слово (aria-label), літери приховані */}
          <h1 className={styles.title} aria-label="Offerly">
            {BRAND.split('').map((letter, index) => (
              <span
                key={index}
                className={styles.letter}
                style={{ '--i': index } as CSSProperties}
                aria-hidden="true"
              >
                {letter}
              </span>
            ))}
          </h1>

          <p className={styles.tagline}>Продуктивність без хаосу</p>
          <p className={styles.subtitle}>
            Вакансії, етапи, нагадування й нотатки — на одній зручній дошці. Перестань тримати все в
            голові й шукати потрібну вкладку: Offerly підкаже, що робити далі, і покаже твій прогрес.
          </p>

          <div className={styles.actions}>
            <ButtonLink href={ROUTES.board} size="lg" className={styles.primary}>
              Почати безкоштовно
              <ArrowRight size={18} />
            </ButtonLink>
          </div>
        </div>

        {/* Права частина: скляна рамка з дошкою і "плаваючі" скляні картки з цифрами поверх неї */}
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.frame}>
            <BoardPreview compact />
          </div>

          <div className={cn(styles.chip, styles.chipStats)}>
            <span className={styles.chipLabel}>Відгуків за тиждень</span>
            <span className={styles.chipValue}>24</span>
            <Sparkline values={SAMPLE_WEEK} color="#7df9ff" />
          </div>

          <div className={cn(styles.chip, styles.chipOffer)}>
            <span className={styles.chipIcon}>
              <PartyPopper size={18} />
            </span>
            <span>
              <span className={styles.chipLabel}>Новий етап</span>
              <strong>Офер · Nebula Labs</strong>
            </span>
          </div>

          <div className={cn(styles.chip, styles.chipReminder)}>
            <BellRing size={16} />
            Завтра 10:00 — співбесіда
          </div>
        </div>
      </div>

      <ul className={cn('container', styles.highlights)}>
        {HIGHLIGHTS.map((item) => (
          <li key={item}>
            <span className={styles.check} aria-hidden="true">
              <Check size={14} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
