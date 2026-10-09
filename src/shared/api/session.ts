import { supabase } from './supabaseClient'

// Один спільний Promise на всі запити: якщо застосунок одночасно робить кілька запитів,
// вхід відбудеться ОДИН раз, а не створить кількох анонімних користувачів
let sessionPromise: Promise<void> | null = null

// Гарантує, що в браузера є користувач. Викликати перед кожним запитом до бази.
//  - Сесія вже є (збережена в localStorage з минулого візиту) → нічого не робимо.
//  - Немає (перший візит, очищені дані сайту) → анонімний вхід: Supabase створює
//    нового користувача без email і пароля, і RLS показуватиме йому лише його рядки.
export function ensureSession(): Promise<void> {
  sessionPromise ??= signInIfNeeded().catch((error: unknown) => {
    sessionPromise = null // невдача не "запам'ятовується": наступний запит спробує ще раз
    throw error
  })
  return sessionPromise
}

async function signInIfNeeded() {
  const { data } = await supabase.auth.getSession()
  if (data.session) return

  const { error } = await supabase.auth.signInAnonymously()
  if (error) {
    throw new Error(`Не вдалося увійти: ${error.message}`, { cause: error })
  }
}
