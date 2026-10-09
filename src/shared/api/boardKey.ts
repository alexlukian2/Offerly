// Ключ дошки: формат і "службова пошта", яку з нього виводимо.
// Копія supabase/functions/create-board-key/boardKey.ts — функція й застосунок мають виводити
// ту саму пошту з того самого ключа (тест boardKey.test.ts стежить, що копії не розійшлися)

// Base32 без схожих символів (0/O, 1/I/L): ключ зручно переписати вручну
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const KEY_LENGTH = 20 // ≈ 99 біт випадковості — підібрати неможливо

export function generateBoardKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH))
  const chars = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length])
  // OFR-XXXXX-XXXXX-XXXXX-XXXXX
  return 'OFR-' + chars.join('').match(/.{5}/g)!.join('-')
}

// Нормалізація: великі літери, без пробілів — ключ можна вставити як завгодно
export function normalizeBoardKey(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9-]/g, '')
}

export function isBoardKey(input: string): boolean {
  return /^OFR(-[A-Z0-9]{5}){4}$/.test(normalizeBoardKey(input))
}

// Службова пошта = хеш ключа. Сам ключ — пароль. Домен .invalid зарезервований стандартом:
// на нього лист ніколи не піде
export async function boardKeyEmail(key: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalizeBoardKey(key)),
  )
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
  return `board-${hex.slice(0, 24)}@offerly.invalid`
}
