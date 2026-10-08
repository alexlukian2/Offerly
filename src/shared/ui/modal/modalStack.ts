// Стек відкритих модалок. Потрібен, коли одна модалка відкрита поверх іншої:
// Escape має закривати лише верхню, а прокрутку сторінки — повертати лише тоді,
// коли закрилась остання.
const openModals: string[] = []

export function registerModal(id: string) {
  if (openModals.length === 0) {
    document.body.style.overflow = 'hidden'
  }
  openModals.push(id)
}

export function unregisterModal(id: string) {
  const index = openModals.indexOf(id)
  if (index !== -1) {
    openModals.splice(index, 1)
  }
  if (openModals.length === 0) {
    document.body.style.overflow = ''
  }
}

export function isTopModal(id: string) {
  return openModals.at(-1) === id
}
