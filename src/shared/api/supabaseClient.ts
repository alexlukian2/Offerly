import { createClient } from '@supabase/supabase-js'

// Значення беруться з .env.local під час збірки (Vite підставляє лише змінні з префіксом VITE_)
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  // Падаємо одразу й зрозуміло, а не загадковою помилкою при першому запиті
  throw new Error(
    'Не задано VITE_SUPABASE_URL або VITE_SUPABASE_PUBLISHABLE_KEY. Створи .env.local (див. README).',
  )
}

// Один клієнт на весь застосунок. Сесію (у т.ч. анонімну) зберігаємо в localStorage —
// інакше після оновлення сторінки браузер став би НОВИМ користувачем з порожньою дошкою.
// autoRefreshToken — токен живе годину, бібліотека сама оновлює його перед закінченням
export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
