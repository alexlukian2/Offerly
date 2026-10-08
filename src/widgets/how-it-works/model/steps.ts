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
    title: 'Додай вакансію',
    description: 'Встав посилання або заповни коротку форму: компанія, позиція, зарплата — за хвилину.',
  },
  {
    id: 'track',
    icon: Columns3,
    title: 'Веди по етапах',
    description: 'Отримав відповідь — перетягни картку далі: тестове, інтерв’ю, офер.',
  },
  {
    id: 'improve',
    icon: ChartNoAxesCombined,
    title: 'Аналізуй і покращуй',
    description: 'Дивись, на якому етапі відсіюєшся найчастіше, і підтягуй саме це.',
  },
]
