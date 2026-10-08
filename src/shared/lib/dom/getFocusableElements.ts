const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Усі елементи всередині container, на які можна перейти клавішею Tab, — у порядку DOM
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    // Відкидаємо приховані (display: none) — на них фокус не перейде
    (element) => element.getClientRects().length > 0,
  )
}
