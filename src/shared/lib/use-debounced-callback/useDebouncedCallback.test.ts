import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedCallback } from './useDebouncedCallback'

describe('useDebouncedCallback', () => {
  // Фальшиві таймери: час рухається лише тоді, коли ми скажемо. Тест не чекає 300 мс насправді
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('викликає функцію один раз — після паузи, з останнім аргументом', () => {
    const callback = vi.fn() // "шпигун": запам'ятовує, скільки разів і з чим його викликали
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    result.current('f')
    result.current('fr')
    result.current('fro')
    vi.advanceTimersByTime(299)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('fro')
  })

  it('скасовує запланований виклик, коли компонент зникає', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300))

    result.current('x')
    unmount()
    vi.advanceTimersByTime(1000)

    expect(callback).not.toHaveBeenCalled()
  })
})
