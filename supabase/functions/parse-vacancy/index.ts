// Supabase Edge Function: отримує посилання на вакансію, завантажує сторінку НА СЕРВЕРІ
// і повертає знайдені поля. Браузер сам цього зробити не може: чужий сайт не дозволяє
// читати свої сторінки з інших доменів (CORS).
//
// Розгортання (Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor):
//   назва parse-vacancy, три файли: index.ts, handler.ts, parseVacancy.ts.
//   У налаштуваннях функції ВИМКНУТИ перевірку JWT (перемикач "Verify JWT"): publishable-ключ (sb_publishable_…)
//   не є JWT, і з увімкненою перевіркою шлюз відхилить запит з 401.
// Або CLI: supabase functions deploy parse-vacancy --no-verify-jwt
import { handleRequest } from './handler.ts'

Deno.serve(handleRequest)
