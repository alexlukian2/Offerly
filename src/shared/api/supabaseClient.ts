import { createClient } from '@supabase/supabase-js'

// Значення беруться з .env.local під час збірки (Vite підставляє лише змінні з префіксом VITE_)
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  // Падаємо одразу й зрозуміло, а не загадковою помилкою при першому запиті
  throw new Error(
    'Не задано VITE_SUPABASE_URL або VITE_SUPABASE_PUBLISHABLE_KEY. Створи .env.local (див. урок 22).',
  )
}

// Один клієнт на весь застосунок. Входу в акаунт поки немає, тож сесію не зберігаємо
export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false },
})
