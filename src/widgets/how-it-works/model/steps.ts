import type { LucideIcon } from 'lucide-react'
import { ChartNoAxesCombined, Columns3, Link } from 'lucide-react'

export type Step = {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export const steps: Step[] = [
  {
    id: 'add',
    icon: Link,
    title: 'Збери все докупи',
    description: 'Встав посилання — і вакансія вже на дошці. Хаос із закладок і таблиць зникає за хвилину.',
  },
  {
    id: 'track',
    icon: Columns3,
    title: 'Рухайся вперед',
    description: 'Перетягуй картки, став нагадування, клей нотатки. Голова вільна для важливого.',
  },
  {
    id: 'improve',
    icon: ChartNoAxesCombined,
    title: 'Бач свій прогрес',
    description: 'Серія днів, ціль на тиждень і статистика показують, що ти рухаєшся — і що підтягнути.',
  },
]
