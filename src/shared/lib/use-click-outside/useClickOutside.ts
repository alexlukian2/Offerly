import { useEffect, useEffectEvent, type RefObject } from 'react'

type UseClickOutsideOptions = {
  enabled?: boolean
}

// Викликає onClickOutside, коли користувач натискає будь-де ПОЗА елементом з ref
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  { enabled = true }: UseClickOutsideOptions = {},
) {
  const handleClickOutside = useEffectEvent(onClickOutside)

  useEffect(() => {
    if (!enabled) return

    function handlePointerDown(event: PointerEvent) {
      const element = ref.current
      if (element && event.target instanceof Node && !element.contains(event.target)) {
        handleClickOutside()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [enabled, ref])
}
