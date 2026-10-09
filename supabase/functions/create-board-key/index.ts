// Supabase Edge Function: створює "ключ дошки" для поточного користувача.
// Ключ стає паролем, а виведена з нього службова пошта — логіном. Так анонімний користувач
// зможе зайти на свою дошку з іншого браузера, ввівши лише ключ.
//
// Розгортання: Dashboard → Edge Functions → Deploy a new function → назва create-board-key,
//   файли index.ts і boardKey.ts. Перевірку JWT ("Verify JWT") ВИМКНУТИ — користувача функція
//   перевіряє сама (auth.getUser нижче).
// SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY Supabase передає функції сам — нічого вписувати не треба.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { boardKeyEmail, generateBoardKey } from './boardKey.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Лише POST' }, 405)

  // Службовий клієнт — з правами адміністратора Auth. Ключ є лише на сервері Supabase
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )

  // Хто кличе: токен сесії користувача з заголовка. Немає або недійсний — відмова
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return json({ error: 'Потрібна активна сесія' }, 401)

  const key = generateBoardKey()
  const { error: updateError } = await admin.auth.admin.updateUserById(data.user.id, {
    email: await boardKeyEmail(key),
    password: key,
    email_confirm: true, // пошта службова — підтверджувати нічого
  })
  if (updateError) {
    console.error(updateError)
    return json({ error: 'Не вдалося створити ключ' }, 500)
  }

  // Ключ віддаємо ОДИН раз: у базі зберігається лише хеш пароля, показати його знову неможливо
  return json({ key })
})
