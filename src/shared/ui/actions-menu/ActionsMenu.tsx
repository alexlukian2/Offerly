import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { LucideIcon } from 'lucide-react'
import { Ellipsis } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import styles from './ActionsMenu.module.css'

export type ActionsMenuItem = {
  label: string
  icon: LucideIcon
  onSelect: () => void
}

type ActionsMenuProps = {
  label: string // для скрінрідера: "Ще дії"
  items: ActionsMenuItem[]
  className?: string
}

// Кнопка "⋯", що ховає другорядні дії. Radix дає поведінку меню: стрілки, Escape,
// повернення фокусу, ролі menu/menuitem. Вигляд — наш (скло, як у випадних списків)
export function ActionsMenu({ label, items, className }: ActionsMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={cn(styles.trigger, className)} aria-label={label}>
        <Ellipsis size={18} aria-hidden="true" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} align="end" sideOffset={6}>
          {items.map(({ label: itemLabel, icon: Icon, onSelect }) => (
            <DropdownMenu.Item
              key={itemLabel}
              className={styles.item}
              // Дію запускаємо ПІСЛЯ того, як меню закрилось і повернуло фокус на "⋯".
              // Інакше модальне вікно, яке відкриває дія, і меню "сперечались" би за фокус
              onSelect={() => requestAnimationFrame(onSelect)}
            >
              <Icon size={16} aria-hidden="true" />
              {itemLabel}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
