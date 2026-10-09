import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './FloatingShapes.module.css'

type Shape = {
  kind: 'pink' | 'blue' | 'lilac' | 'sun' | 'mint' | 'ring'
  size: string // CSS-довжина: '22rem', '40vmin'
  top?: string
  left?: string
  right?: string
  bottom?: string
  blur?: number // px: розмиті — "далеко", чіткі — "близько" (глибина)
  duration?: number // секунди одного циклу "плавання"
  delay?: number
}

// Набори фігур під різні місця. Позиції частково за межами екрана — фігури "виглядають" з-за краю
const VARIANTS: Record<'app' | 'hero' | 'section', Shape[]> = {
  app: [
    { kind: 'pink', size: '24rem', bottom: '-11rem', left: '34%', blur: 3, duration: 18 },
    { kind: 'blue', size: '10rem', top: '38%', right: '-3.5rem', duration: 14, delay: -4 },
    { kind: 'sun', size: '3rem', bottom: '18%', right: '22%', blur: 1, duration: 11, delay: -2 },
    { kind: 'ring', size: '20rem', top: '-8rem', right: '12%', duration: 22 },
    { kind: 'lilac', size: '6rem', top: '14%', left: '58%', blur: 10, duration: 16, delay: -7 },
  ],
  hero: [
    { kind: 'pink', size: 'min(34rem, 70vw)', top: '-8rem', right: '-10rem', duration: 16 },
    { kind: 'blue', size: '9rem', bottom: '-4rem', left: '-3rem', duration: 13, delay: -3 },
    { kind: 'sun', size: '4.5rem', top: '18%', left: '6%', blur: 1, duration: 10, delay: -5 },
    { kind: 'mint', size: '2.25rem', bottom: '22%', left: '12%', duration: 9, delay: -1 },
    { kind: 'ring', size: '26rem', top: '20%', left: '-12rem', duration: 24 },
    { kind: 'lilac', size: '9rem', top: '8%', left: '44%', blur: 14, duration: 15, delay: -6 },
  ],
  section: [
    { kind: 'lilac', size: '16rem', top: '-5rem', right: '-6rem', blur: 30, duration: 20 },
    { kind: 'blue', size: '5rem', bottom: '8%', left: '4%', blur: 2, duration: 12, delay: -3 },
    { kind: 'pink', size: '3rem', top: '22%', left: '10%', duration: 10, delay: -6 },
  ],
}

type FloatingShapesProps = {
  variant: keyof typeof VARIANTS
  className?: string
}

// Декоративні "планети" на фоні: об'ємні кольорові сфери, кільця й маленькі орби.
// Лише прикраса — aria-hidden і pointer-events: none, тож не заважають ні клікам, ні скрінрідеру
export function FloatingShapes({ variant, className }: FloatingShapesProps) {
  return (
    <div className={cn(styles.layer, className)} aria-hidden="true">
      {VARIANTS[variant].map((shape, index) => (
        <span
          key={index}
          className={cn(styles.shape, styles[shape.kind])}
          style={
            {
              width: shape.size,
              top: shape.top,
              left: shape.left,
              right: shape.right,
              bottom: shape.bottom,
              filter: shape.blur ? `blur(${shape.blur}px)` : undefined,
              '--duration': `${shape.duration ?? 14}s`,
              '--delay': `${shape.delay ?? 0}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
