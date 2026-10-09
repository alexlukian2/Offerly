import { describe, expect, it } from 'vitest'
// ?raw — Vite віддає вміст файлу рядком: порівнюємо дві копії коду без доступу до файлової системи
import functionCopy from '../../../supabase/functions/create-board-key/boardKey.ts?raw'
import { boardKeyEmail, generateBoardKey, isBoardKey, normalizeBoardKey } from './boardKey'
import appCopy from './boardKey.ts?raw'

describe('ключ дошки', () => {
  it('генерує ключ потрібного формату, щоразу новий', () => {
    const key = generateBoardKey()
    expect(isBoardKey(key)).toBe(true)
    expect(generateBoardKey()).not.toBe(key)
  })

  it('нормалізує ключ, вставлений з пробілами чи малими літерами', () => {
    expect(normalizeBoardKey(' ofr-abcde-fghjk-mnpqr-stuvw ')).toBe('OFR-ABCDE-FGHJK-MNPQR-STUVW')
    expect(isBoardKey('ofr-abcde-fghjk-mnpqr-stuvw')).toBe(true)
    expect(isBoardKey('щось інше')).toBe(false)
  })

  it('службова пошта однакова для однакового ключа і не містить самого ключа', async () => {
    const email = await boardKeyEmail('OFR-ABCDE-FGHJK-MNPQR-STUVW')
    expect(email).toBe(await boardKeyEmail('ofr-abcde-fghjk-mnpqr-stuvw'))
    expect(email).toMatch(/^board-[0-9a-f]{24}@offerly\.invalid$/)
    expect(email).not.toContain('ABCDE')
  })

  it('копія в застосунку збігається з файлом Edge Function', () => {
    // Перші 3 рядки — коментар, він у копіях різний
    const body = (source: string) => source.split('\n').slice(3).join('\n')
    expect(body(appCopy)).toBe(body(functionCopy))
  })
})
