// Виконується перед КОЖНИМ файлом тестів
import '@testing-library/jest-dom/vitest' // матчери toBeInTheDocument, toHaveValue, toBeDisabled...
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup() // прибрати з DOM усе, що відрендерив тест
  localStorage.clear() // кожен тест стартує з чистого сховища
})

// jsdom не вміє matchMedia (немає справжнього екрана) — даємо мінімальну заглушку:
// "система у світлій темі, жоден медіа-запит не збігається"
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// jsdom не вміє прокручувати сторінку, а ScrollRestoration роутера викликає scrollTo
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

// Radix Select користується API, яких у jsdom немає: захоплення вказівника і прокрутка до пункту
Element.prototype.hasPointerCapture = vi.fn(() => false)
Element.prototype.releasePointerCapture = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// jsdom нічого не малює, тож і не знає, що видно на екрані. Заглушка: спостерігач, який мовчить
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
window.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver
