import type { z } from 'zod'
import { NetworkError } from '@/shared/lib/errors'

// Помилка Supabase → наша помилка. Мережеві збої (немає інтернету, сервер недоступний)
// стають NetworkError — інтерфейс покаже зрозуміле "немає з'єднання"
export function toDatabaseError(error: { message: string }): Error {
  if (!navigator.onLine || /fetch|network/i.test(error.message)) return new NetworkError()
  return new Error(`Помилка бази даних: ${error.message}`, { cause: error })
}

// Відповідь сервера — "чужі" дані: перевіряємо схемою. Помилку zod кладемо в cause —
// користувач побачить зрозуміле повідомлення, а розробник у консолі — що саме не так
export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error('Сервер повернув дані в неочікуваному форматі', { cause: result.error })
  }
  return result.data
}
