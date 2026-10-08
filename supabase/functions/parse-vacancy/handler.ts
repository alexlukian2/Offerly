import { parseVacancy } from './parseVacancy.ts'

const FETCH_TIMEOUT_MS = 8000
const MAX_HTML_BYTES = 2_000_000
const MAX_REDIRECTS = 3

// Відповіді функції читає браузер з іншого домену (localhost, потім домен застосунку) —
// тож сервер має явно це дозволити
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Помилка, текст якої можна показати користувачу
class PublicError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function handleRequest(request: Request): Promise<Response> {
  // Браузер перед POST з JSON надсилає "попередній" запит OPTIONS: чи можна?
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Лише POST' }, 405)

  try {
    const body: unknown = await request.json().catch(() => null)
    const rawUrl = typeof body === 'object' && body !== null && 'url' in body ? body.url : null
    const url = toSafeUrl(rawUrl)

    const { html, finalUrl } = await fetchHtml(url)
    const vacancy = parseVacancy(html, finalUrl)

    if (!vacancy.position && !vacancy.company) {
      throw new PublicError('Не вдалося знайти дані вакансії на цій сторінці', 422)
    }
    return json({ ...vacancy, url: finalUrl.href })
  } catch (error) {
    if (error instanceof PublicError) return json({ error: error.message }, error.status)
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return json({ error: 'Сайт вакансії не відповідає. Спробуй пізніше' }, 504)
    }
    console.error(error)
    return json({ error: 'Не вдалося завантажити сторінку вакансії' }, 502)
  }
}

// Функція завантажує БУДЬ-ЯКЕ посилання від користувача — це небезпечно (SSRF):
// нею могли б "постукати" у внутрішню мережу сервера. Тому дозволяємо лише публічні http(s)-адреси
function toSafeUrl(value: unknown): URL {
  let url: URL
  try {
    url = new URL(String(value))
  } catch {
    throw new PublicError('Некоректне посилання', 400)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new PublicError('Посилання має починатися з http:// або https://', 400)
  }
  if (url.port || url.username || isPrivateHost(url.hostname)) {
    throw new PublicError('Таке посилання не підтримується', 400)
  }
  return url
}

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true
  if (host.endsWith('.internal') || !host.includes('.')) return true
  // IPv6-адреси не приймаємо взагалі: вакансії живуть на доменах
  if (host.includes(':')) return true

  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (!ipv4) return false
  const [a, b] = [Number(ipv4[1]), Number(ipv4[2])]
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

async function fetchHtml(url: URL): Promise<{ html: string; finalUrl: URL }> {
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS)
  let current = url

  // Переадресації проходимо вручну: кожну нову адресу теж перевіряємо на безпечність
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const response = await fetch(current, {
      redirect: 'manual',
      signal,
      headers: {
        // Сайти за Cloudflare (DOU) відхиляють запити з "ботським" User-Agent — представляємось браузером
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'uk,en;q=0.8',
      },
    })

    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      current = toSafeUrl(new URL(location, current).href)
      continue
    }

    if (response.status === 403 || response.status === 429) {
      // У логах функції (Dashboard → Edge Functions → parse-vacancy → Logs) видно, хто відмовив
      console.warn('blocked', response.status, current.hostname, response.headers.get('server'))
      throw new PublicError(
        'Сайт не дозволяє автоматично читати сторінку. Заповни поля вручну',
        422,
      )
    }
    if (!response.ok) {
      throw new PublicError(`Сайт вакансії відповів помилкою ${response.status}`, 422)
    }
    if (!response.headers.get('content-type')?.includes('html')) {
      throw new PublicError('За посиланням не вебсторінка', 422)
    }
    return { html: await readLimited(response), finalUrl: current }
  }
  throw new PublicError('Забагато переадресацій', 422)
}

// Читаємо не більше MAX_HTML_BYTES: величезна сторінка не має "покласти" функцію
async function readLimited(response: Response) {
  const reader = response.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let size = 0
  while (size < MAX_HTML_BYTES) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    size += value.byteLength
  }
  await reader.cancel() // решту сторінки не завантажуємо
  return new Blob(chunks).text()
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
