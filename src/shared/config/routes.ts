export const ROUTES = {
  home: '/',
  board: '/app',
  stats: '/app/stats',
  // ":id" — динамічний сегмент: на його місці може бути будь-яке значення
  applicationDetails: '/app/applications/:id',
  // Сторінка для гостя: дошка або вакансія, якою поділились (лише для читання)
  shared: '/s/:shareId',
} as const

// Будує конкретну адресу з шаблону: getApplicationPath('a1') → '/app/applications/a1'
export function getApplicationPath(id: string) {
  return ROUTES.applicationDetails.replace(':id', encodeURIComponent(id))
}

export function getSharePath(shareId: string) {
  return ROUTES.shared.replace(':shareId', encodeURIComponent(shareId))
}
