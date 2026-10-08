import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

const isNumber = (value: unknown): value is number => typeof value === 'number'

describe('useLocalStorage', () => {
  it('без збереженого значення бере значення за замовчуванням', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0, isNumber))

    expect(result.current[0]).toBe(0)
  })

  it('читає збережене значення', () => {
    localStorage.setItem('count', '42')

    const { result } = renderHook(() => useLocalStorage('count', 0, isNumber))

    expect(result.current[0]).toBe(42)
  })

  it('ігнорує дані неправильного типу', () => {
    localStorage.setItem('count', '"не число"')

    const { result } = renderHook(() => useLocalStorage('count', 0, isNumber))

    expect(result.current[0]).toBe(0)
  })

  it('зберігає нове значення в localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0, isNumber))

    act(() => result.current[1](7))

    expect(result.current[0]).toBe(7)
    expect(localStorage.getItem('count')).toBe('7')
  })

  it('підхоплює зміну з іншої вкладки (подія storage)', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0, isNumber))

    act(() => {
      // Так браузер повідомляє ІНШІ вкладки про зміну — імітуємо це вручну
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'count', newValue: '99', storageArea: localStorage }),
      )
    })

    expect(result.current[0]).toBe(99)
  })
})
