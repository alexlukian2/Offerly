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
    description: 'Кожна вакансія — картка. Перетягнув на наступний етап — і одразу видно, що робити далі.',
  },
  {
    id: 'details',
    icon: FileText,
    title: 'Усе в одній картці',
    description: 'Посилання, зарплата, формат роботи, шлях етапами — без пошуку по вкладках і чатах.',
  },
  {
    id: 'reminders',
    icon: BellRing,
    title: 'Нагадування',
    description: 'Постав час — і викинь із голови. Offerly сам нагадає про дзвінок чи дедлайн.',
  },
  {
    id: 'stats',
    icon: ChartColumn,
    title: 'Прогрес у цифрах',
    description: 'Календар активності, серія днів, тижнева ціль і воронка — бачиш, що працює, а що ні.',
  },
  {
    id: 'autofill',
    icon: Sparkles,
    title: 'Автозаповнення',
    description: 'Встав посилання — компанія, позиція й формат заповняться самі. Секунди замість хвилин.',
  },
  {
    id: 'notes',
    icon: NotebookPen,
    title: 'Нотатки у клітинку',
    description: 'Приколи листочок на дошку або до вакансії: питання, імена, ідеї — усе під рукою.',
  },
]
