import { boardKeyEmail, isBoardKey, normalizeBoardKey } from './boardKey'
import { supabase } from './supabaseClient'

// Запис "у цьому браузері вже була дошка" — id користувача. Окремо від сесії Supabase:
// якщо сесію буде втрачено (не вдалося оновити токен), запис лишиться — і ми це помітимо
const KNOWN_USER_KEY = 'offerly:known-user'

// Сесії немає, хоча раніше в цьому браузері була дошка. Новий порожній користувач тут —
// найгірше, що можна зробити: людина подумає, що дані зникли. Тож зупиняємось і пояснюємо
export class SessionLostError extends Error {
  constructor() {
    super('Сесію втрачено')
    this.name = 'SessionLostError'
  }
}

export function isSessionLostError(error: unknown): error is SessionLostError {
  return error instanceof SessionLostError
}

function readKnownUser(): string | null {
  try {
    return localStorage.getItem(KNOWN_USER_KEY)
  } catch {
    return null
  }
}

function rememberUser(id: string) {
  try {
    localStorage.setItem(KNOWN_USER_KEY, id)
  } catch {
    // сховище недоступне (приватний режим) — просто не запам'ятовуємо
  }
}

// Один спільний Promise на всі запити: якщо застосунок одночасно робить кілька запитів,
// вхід відбудеться ОДИН раз, а не створить кількох анонімних користувачів
let sessionPromise: Promise<void> | null = null

// Гарантує, що в браузера є користувач. Викликати перед кожним запитом до бази.
//  - Сесія є → запам'ятовуємо, хто це, і далі.
//  - Сесії немає і браузер тут уперше → анонімний вхід (нова порожня дошка).
//  - Сесії немає, а дошка тут БУЛА → SessionLostError: вирішує людина (ключ або нова дошка)
export function ensureSession(): Promise<void> {
  sessionPromise ??= signInIfNeeded().catch((error: unknown) => {
    sessionPromise = null // невдача не "запам'ятовується": наступний запит спробує ще раз
    throw error
  })
  return sessionPromise
}

async function signInIfNeeded() {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    rememberUser(data.session.user.id)
    return
  }

  if (readKnownUser()) throw new SessionLostError()

  const { data: signedIn, error } = await supabase.auth.signInAnonymously()
  if (error) {
    throw new Error(`Не вдалося увійти: ${error.message}`, { cause: error })
  }
  if (signedIn.user) rememberUser(signedIn.user.id)
}

// "Почати нову дошку" після втрати сесії: забуваємо стару і входимо заново
export async function startNewBoard() {
  try {
    localStorage.removeItem(KNOWN_USER_KEY)
  } catch {
    // нічого
  }
  sessionPromise = null
  await supabase.auth.signOut({ scope: 'local' })
}

// Вхід на дошку за ключем. Поточна сесія в цьому браузері замінюється
export async function restoreBoard(rawKey: string) {
  if (!isBoardKey(rawKey))
    throw new Error('Це не схоже на ключ дошки. Він виглядає так: OFR-XXXXX-XXXXX-XXXXX-XXXXX')
  const key = normalizeBoardKey(rawKey)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: await boardKeyEmail(key),
    password: key,
  })
  if (error || !data.user) {
    throw new Error(
      'Ключ не підходить. Перевір, чи немає помилки, або створи новий у старому браузері',
      {
        cause: error,
      },
    )
  }
  sessionPromise = null
  rememberUser(data.user.id)
}

// Створити ключ для поточної дошки (Edge Function create-board-key). Старий ключ перестає діяти
export async function createBoardKey(): Promise<string> {
  await ensureSession()
  const { data, error } = await supabase.functions.invoke('create-board-key', { method: 'POST' })
  if (error) {
    throw new Error('Не вдалося створити ключ. Перевір з’єднання і спробуй ще раз', {
      cause: error,
    })
  }
  const key = (data as { key?: unknown } | null)?.key
  if (typeof key !== 'string' || !isBoardKey(key)) throw new Error('Сервер повернув некоректний ключ')

  // Новий пароль = Supabase відкликає ВСІ старі сесії користувача, зокрема й цю.
  // Одразу входимо щойно створеним ключем — браузер отримує свіжу дійсну сесію і не "губить" дошку
  await restoreBoard(key)
  return key
}
