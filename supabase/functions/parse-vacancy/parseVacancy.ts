// Витягує дані вакансії з HTML сторінки. Чистий TypeScript без залежностей:
// той самий файл виконує Edge Function (Deno) і перевіряють тести (Vitest у Node).

export type WorkFormat = 'remote' | 'office' | 'hybrid'

export type ParsedVacancy = {
  position?: string
  company?: string
  workFormat?: WorkFormat
  salary?: string
}

const MAX_LENGTH = 200

// Джерела — від найнадійнішого до найменш надійного. Кожне поле береться з першого джерела, де воно є
export function parseVacancy(html: string, pageUrl: URL): ParsedVacancy {
  const sources = [
    parseJsonLd(html), // schema.org JobPosting: Djinni, LinkedIn, robota.ua, Indeed…
    isHost(pageUrl, 'dou.ua') ? parseDou(html) : {}, // DOU: структурованих даних немає — читаємо розмітку
    isHost(pageUrl, 'djinni.co') ? parseDjinni(html) : {}, // Djinni: формат роботи є лише в розмітці
    parseTitle(html), // будь-який сайт: заголовок "Позиція в Компанія | Сайт"
  ]

  return {
    position: firstDefined(sources, 'position'),
    company: firstDefined(sources, 'company'),
    workFormat: firstDefined(sources, 'workFormat'),
    salary: firstDefined(sources, 'salary'),
  }
}

// Generic K: для key = 'workFormat' результат має тип WorkFormat | undefined, а не "будь-яке поле"
function firstDefined<K extends keyof ParsedVacancy>(sources: ParsedVacancy[], key: K) {
  return sources.find((source) => source[key] !== undefined)?.[key]
}

// ── 1. JSON-LD ─────────────────────────────────────────────────────────────

type JsonObject = Record<string, unknown>

function parseJsonLd(html: string): ParsedVacancy {
  const scripts = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )
  for (const [, json] of scripts) {
    let data: unknown
    try {
      data = JSON.parse(json)
    } catch {
      continue // зламаний JSON на чужому сайті — не наша проблема, шукаємо далі
    }
    const posting = findJobPosting(data)
    if (posting) return fromJobPosting(posting)
  }
  return {}
}

// JobPosting може лежати в корені, в масиві або в "@graph"
function findJobPosting(data: unknown): JsonObject | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findJobPosting(item)
      if (found) return found
    }
    return null
  }
  if (!isObject(data)) return null
  const type = data['@type']
  if (type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))) return data
  return findJobPosting(data['@graph'])
}

function fromJobPosting(posting: JsonObject): ParsedVacancy {
  const organization = posting.hiringOrganization
  const locationType = [posting.jobLocationType].flat()

  return {
    position: clean(posting.title),
    company: clean(isObject(organization) ? organization.name : organization),
    workFormat: locationType.includes('TELECOMMUTE') ? 'remote' : undefined,
    salary: formatSalary(posting.baseSalary),
  }
}

// baseSalary: { currency: 'USD', value: { minValue: 2000, maxValue: 3000 } } або { value: 2500 }
function formatSalary(baseSalary: unknown): string | undefined {
  if (!isObject(baseSalary)) return undefined
  const value = isObject(baseSalary.value) ? baseSalary.value : { value: baseSalary.value }
  const min = toNumber(value.minValue) ?? toNumber(value.value)
  const max = toNumber(value.maxValue)
  if (min === undefined && max === undefined) return undefined

  const amount =
    min !== undefined && max !== undefined && max !== min ? `${min}–${max}` : `${min ?? max}`
  const currency = typeof baseSalary.currency === 'string' ? baseSalary.currency : ''
  return currency === 'USD' ? `$${amount}` : `${amount} ${currency}`.trim()
}

// ── 2. DOU ─────────────────────────────────────────────────────────────────

function parseDou(html: string): ParsedVacancy {
  const company = html.match(/<div class="l-n">\s*<a[^>]*>([^<]+)<\/a>/)?.[1]
  const salary = html.match(/<span class="salary">([^<]+)</)?.[1]
  const place = html.match(/<span class="place[^"]*">([^<]+)</)?.[1]

  return {
    company: clean(company),
    salary: clean(salary),
    workFormat: detectWorkFormat(place),
  }
}

// ── 2.1. Djinni ────────────────────────────────────────────────────────────

// Блок умов: <strong class="d-block font-weight-600">Тільки віддалено</strong> / "Тільки офіс" / "Гібридна…"
function parseDjinni(html: string): ParsedVacancy {
  const conditions = [...html.matchAll(/<strong class="d-block font-weight-600">([^<]+)</g)]
  return {
    workFormat: detectWorkFormat(conditions.map(([, text]) => text).join(' ')),
  }
}

// ── 3. Заголовок сторінки ─────────────────────────────────────────────────

// "System Administrator в Noltic – Djinni", "Senior JS Engineer в Ciklum, Київ, віддалено | DOU",
// "Frontend Developer at Acme | LinkedIn"
function parseTitle(html: string): ParsedVacancy {
  const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1])
  if (!title) return {}

  // Відрізаємо назву сайту після останнього " | ", " – " або " — "
  const withoutSite = title.replace(/\s+[|–—-]\s+[^|–—-]+$/, '')
  const match = withoutSite.match(/^(.+)\s+(?:в|at)\s+(.+)$/)
  if (!match) return { position: withoutSite }

  // Після компанії через кому — місто, зарплата, "віддалено"
  const [company, ...details] = match[2].split(',')
  return {
    position: clean(match[1]),
    company: clean(company),
    workFormat: detectWorkFormat(details.join(',')),
  }
}

// ── Допоміжні ──────────────────────────────────────────────────────────────

function detectWorkFormat(text: string | undefined): WorkFormat | undefined {
  if (!text) return undefined
  const lower = text.toLowerCase()
  if (/гібрид|hybrid/.test(lower)) return 'hybrid'
  if (/віддален|remote|ремоут/.test(lower)) return 'remote'
  if (/офіс|office/.test(lower)) return 'office'
  return undefined
}

function isHost(url: URL, domain: string) {
  return url.hostname === domain || url.hostname.endsWith(`.${domain}`)
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toNumber(value: unknown): number | undefined {
  const number = typeof value === 'string' ? Number(value) : value
  return typeof number === 'number' && Number.isFinite(number) ? number : undefined
}

// Рядок з HTML → чистий текст: сутності (&amp; &nbsp; &#39;) → символи, зайві пробіли геть, обрізка довжини
function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = decodeEntities(value).replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, MAX_LENGTH) : undefined
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  rsquo: '’',
}

function decodeEntities(text: string) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === '#') {
      const number =
        code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity
  })
}
