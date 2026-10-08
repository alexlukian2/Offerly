import type { LucideIcon } from 'lucide-react'
import { BellRing, ChartColumn, FileText, NotebookPen, Sparkles, SquareKanban } from 'lucide-react'

export type Feature = {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export const features: Feature[] = [
  {
    id: 'board',
    icon: SquareKanban,
    title: 'Канбан-дошка',
    description: 'Кожна вакансія — картка. Перетягуй між етапами й одразу бач, де ти зараз.',
  },
  {
    id: 'details',
    icon: FileText,
    title: 'Усе про вакансію',
    description: 'Посилання, зарплатна вилка, формат роботи, контакти рекрутера — в одній картці.',
  },
  {
    id: 'reminders',
    icon: BellRing,
    title: 'Нагадування',
    description: 'Не пропусти співбесіду чи дедлайн тестового. Offerly нагадає заздалегідь.',
  },
  {
    id: 'stats',
    icon: ChartColumn,
    title: 'Статистика воронки',
    description: 'Скільки відгуків доходить до інтерв’ю та оферу — і де варто покращити резюме.',
  },
  {
    id: 'autofill',
    icon: Sparkles,
    title: 'Автозаповнення',
    description: 'Встав посилання на вакансію — компанія, позиція й опис підтягнуться самі.',
  },
  {
    id: 'notes',
    icon: NotebookPen,
    title: 'Нотатки до співбесід',
    description: 'Питання, які ставили, і твої відповіді. Наступна співбесіда буде легшою.',
  },
]
