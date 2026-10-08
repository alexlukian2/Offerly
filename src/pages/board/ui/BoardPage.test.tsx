import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Application, ApplicationInput } from '@/entities/application'
import { NetworkError } from '@/shared/lib/errors'
import { renderApp } from '@/test/renderApp'

// "Сервер у пам'яті": замість справжнього Supabase. vi.hoisted — бо vi.mock піднімається на самий верх
// файлу, і звичайні змінні на момент його виконання ще не існували б
const db = vi.hoisted(() => ({ rows: [] as Application[] }))

vi.mock('@/entities/application/api/applicationsApi', () => ({
  fetchApplications: vi.fn(async () => structuredClone(db.rows)),
  createApplication: vi.fn(async (input: ApplicationInput) => {
    const application = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    db.rows.unshift(application)
    return { ok: true, application }
  }),
  updateApplication: vi.fn(),
  updateApplicationStatus: vi.fn(async (id: string, status: Application['status']) => {
    const row = db.rows.find((item) => item.id === id)!
    row.status = status
    return structuredClone(row)
  }),
  deleteApplication: vi.fn(),
}))

const api = await import('@/entities/application/api/applicationsApi')

const seed: Application[] = [
  { id: 'a1', company: 'Nebula Labs', position: 'Junior React Developer', status: 'applied', workFormat: 'remote', createdAt: '2026-10-01T09:00:00.000Z' },
  { id: 'a2', company: 'Pixelforge', position: 'Frontend Developer', status: 'applied', workFormat: 'office', createdAt: '2026-10-02T09:00:00.000Z' },
  { id: 'a3', company: 'Krona Pay', position: 'Frontend Developer', status: 'test', workFormat: 'hybrid', createdAt: '2026-09-28T09:00:00.000Z' },
]

function column(name: string) {
  return screen.getByRole('region', { name })
}

async function openBoard() {
  const view = renderApp('/app')
  await screen.findByRole('heading', { name: 'Дошка', level: 1 })
  return view
}

describe('Дошка (інтеграційно: увесь застосунок)', () => {
  beforeEach(() => {
    db.rows = structuredClone(seed)
  })

  it('завантажує вакансії з сервера і розкладає по колонках', async () => {
    await openBoard()

    expect(within(column('Тестове')).getByText('Krona Pay')).toBeInTheDocument()
    expect(within(column('Відгукнувся')).getAllByRole('article')).toHaveLength(2)
    expect(api.fetchApplications).toHaveBeenCalled()
  })

  it('пошук фільтрує картки (після debounce)', async () => {
    const { user } = await openBoard()

    await user.type(screen.getByRole('searchbox', { name: 'Пошук вакансій' }), 'krona')

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    // Перевіряємо те, що ПОЧУЄ скрінрідер: текст у live-регіоні (урок 14.12)
    expect(screen.getByText('Знайдено 1 з 3')).toHaveAttribute('aria-live', 'polite')
  })

  it('додає вакансію: запит на сервер → оновлений список', async () => {
    const { user } = await openBoard()

    await user.click(screen.getByRole('button', { name: 'Додати вакансію' }))
    const dialog = screen.getByRole('dialog', { name: 'Нова вакансія' })
    await user.type(within(dialog).getByLabelText('Компанія'), 'Orbita')
    await user.type(within(dialog).getByLabelText('Позиція'), 'Frontend Developer')
    await user.click(within(dialog).getByRole('button', { name: 'Додати вакансію' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(within(column('Відгукнувся')).getByText('Orbita')).toBeInTheDocument()
    expect(api.createApplication).toHaveBeenCalledWith(
      expect.objectContaining({ company: 'Orbita', position: 'Frontend Developer' }),
    )
  })

  it('переміщує картку оптимістично — ще до відповіді сервера', async () => {
    let finishRequest = () => {}
    vi.mocked(api.updateApplicationStatus).mockImplementationOnce(
      (id, status) =>
        new Promise((resolve) => {
          // Сервер "думає", поки тест не скаже
          finishRequest = () => resolve({ ...db.rows.find((item) => item.id === id)!, status })
        }),
    )
    const { user } = await openBoard()

    await user.click(screen.getByRole('button', { name: /Перемістити в «Інтерв’ю»/ }))

    // Сервер ще не відповів, а картка вже в новій колонці
    expect(await within(column('Інтерв’ю')).findByText('Krona Pay')).toBeInTheDocument()
    finishRequest()
  })

  it('при помилці мережі повертає картку на місце і показує сповіщення', async () => {
    vi.mocked(api.updateApplicationStatus).mockRejectedValueOnce(new NetworkError())
    const { user } = await openBoard()

    await user.click(screen.getByRole('button', { name: /Перемістити в «Інтерв’ю»/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('немає з’єднання')
    expect(within(column('Тестове')).getByText('Krona Pay')).toBeInTheDocument()
  })

  it('якщо сервер недоступний при завантаженні — зрозуміла сторінка помилки', async () => {
    vi.mocked(api.fetchApplications).mockRejectedValueOnce(new NetworkError())
    vi.spyOn(console, 'error').mockImplementation(() => {}) // React логує перехоплену помилку

    renderApp('/app')

    expect(
      await screen.findByRole('heading', { name: 'Немає з’єднання з сервером' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument() // сайдбар лишився
  })
})
