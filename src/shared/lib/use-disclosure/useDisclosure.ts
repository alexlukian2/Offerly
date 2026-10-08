import { useCallback, useMemo, useState } from 'react'

// "Disclosure" — усе, що можна відкрити й закрити: модалка, меню, акордеон, тултіп
export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  // useCallback: та сама функція між рендерами. Не залежать ні від чого, крім setIsOpen,
  // а setter від useState React гарантує стабільним — тому масив залежностей порожній
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((current) => !current), [])

  // Сам об'єкт теж стабільний, поки не змінився isOpen —
  // його безпечно передавати в memo-компоненти і в залежності ефектів
  return useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle])
}
