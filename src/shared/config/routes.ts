export const ROUTES = {
  home: '/',
  board: '/app',
  stats: '/app/stats',
  // ":id" — динамічний сегмент: на його місці може бути будь-яке значення
  applicationDetails: '/app/applications/:id',
} as const

// Будує конкретну адресу з шаблону: getApplicationPath('a1') → '/app/applications/a1'
export function getApplicationPath(id: string) {
  return ROUTES.applicationDetails.replace(':id', encodeURIComponent(id))
}
