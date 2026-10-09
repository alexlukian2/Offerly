// Зовнішні посилання проекту — в одному місці
export const REPOSITORY_URL = 'https://github.com/alexlukian2/Offerly'

// Публічна адреса застосунку — для посилань "Поділитися".
// Не window.location.origin: застосунок можна відкрити на адресі конкретного деплою Vercel
// (offerly-<хеш>-....vercel.app), а такі адреси Vercel закриває для сторонніх (Deployment Protection) —
// гість побачив би вхід у Vercel замість дошки.
// Локально (localhost) лишаємо поточну адресу — щоб посилання можна було перевірити в розробці
const PRODUCTION_URL = 'https://offerly-rho.vercel.app'

export function getPublicAppUrl() {
  const { hostname, origin } = window.location
  return hostname === 'localhost' || hostname === '127.0.0.1' ? origin : PRODUCTION_URL
}
