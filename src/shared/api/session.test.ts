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
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    const { ensureSession } = await import('./session')

    await ensureSession()

    expect(auth.signInAnonymously).not.toHaveBeenCalled()
  })

  it('входить анонімно лише один раз, навіть якщо запитів кілька одночасно', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const { ensureSession } = await import('./session')

    await Promise.all([ensureSession(), ensureSession(), ensureSession()])

    expect(auth.signInAnonymously).toHaveBeenCalledTimes(1)
  })

  it('після невдалого входу наступний виклик пробує знову', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously
      .mockResolvedValueOnce({ error: { message: 'Anonymous sign-ins are disabled' } })
      .mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })
    const { ensureSession } = await import('./session')

    await expect(ensureSession()).rejects.toThrow(
      'Не вдалося увійти: Anonymous sign-ins are disabled',
    )
    await expect(ensureSession()).resolves.toBeUndefined()
    expect(auth.signInAnonymously).toHaveBeenCalledTimes(2)
  })

  it('якщо дошка в цьому браузері вже була, а сесії немає — не створює нового користувача', async () => {
    localStorage.setItem('offerly:known-user', 'old-user')
    auth.getSession.mockResolvedValue({ data: { session: null } })
    const { ensureSession, SessionLostError } = await import('./session')

    await expect(ensureSession()).rejects.toBeInstanceOf(SessionLostError)
    expect(auth.signInAnonymously).not.toHaveBeenCalled()
  })

  it('запам’ятовує користувача після входу', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signInAnonymously.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null })
    const { ensureSession } = await import('./session')

    await ensureSession()

    expect(localStorage.getItem('offerly:known-user')).toBe('new-user')
  })
})
