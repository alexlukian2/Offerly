import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInAnonymously: vi.fn(),
}))

vi.mock('./supabaseClient', () => ({ supabase: { auth } }))

describe('ensureSession', () => {
  beforeEach(() => {
    // Модуль тримає Promise у змінній — для кожного тесту беремо свіжу копію модуля
    vi.resetModules()
    auth.getSession.mockReset()
    auth.signInAnonymously.mockReset()
  })

  it('не входить повторно, якщо сесія вже є', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: {} } } })
    const { ensureSession } = await import('./session')

    await ensureSession()

    expect(auth.signInAnonymously).not.toHaveBeenCalled()
  })

  it('входить анонімно лише один раз, навіть якщо запитів кілька одночасно', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously.mockResolvedValue({ error: null })
    const { ensureSession } = await import('./session')

    await Promise.all([ensureSession(), ensureSession(), ensureSession()])

    expect(auth.signInAnonymously).toHaveBeenCalledTimes(1)
  })

  it('після невдалого входу наступний виклик пробує знову', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously
      .mockResolvedValueOnce({ error: { message: 'Anonymous sign-ins are disabled' } })
      .mockResolvedValueOnce({ error: null })
    const { ensureSession } = await import('./session')

    await expect(ensureSession()).rejects.toThrow('Не вдалося увійти: Anonymous sign-ins are disabled')
    await expect(ensureSession()).resolves.toBeUndefined()
    expect(auth.signInAnonymously).toHaveBeenCalledTimes(2)
  })
})
