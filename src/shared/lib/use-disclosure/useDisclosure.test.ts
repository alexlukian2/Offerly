import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDisclosure } from './useDisclosure'

describe('useDisclosure', () => {
  it('відкриває, закриває і перемикає', () => {
    // renderHook рендерить "порожній" компонент, який лише викликає хук
    const { result } = renderHook(() => useDisclosure())

    expect(result.current.isOpen).toBe(false)

    // act: "виконай дію і дочекайся, поки React оновить стан і перерендерить"
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(false)
  })

  it('повертає стабільні функції між рендерами', () => {
    const { result, rerender } = renderHook(() => useDisclosure())
    const first = result.current

    rerender()

    expect(result.current).toBe(first) // той самий об'єкт, поки isOpen не змінився
    act(() => result.current.open())
    expect(result.current.close).toBe(first.close) // функції — ті самі навіть після зміни
  })
})
