import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Application, ApplicationInput } from '@/entities/application'
import type { Note } from '@/entities/note'
import { NetworkError } from '@/shared/lib/errors'
import { renderApp } from '@/test/renderApp'

// "Сервер у пам'яті": замість справжнього Supabase. vi.hoisted — бо vi.mock піднімається на самий верх
// файлу, і звичайні змінні на момент його виконання ще не існували б
const db = vi.hoisted(() => ({ rows: [] as Application[], notes: [] as Note[] }))

// notesQueryOptions теж підміняємо: в оригіналі queryFn посилається на ОРИГІНАЛЬНИЙ fetchNotes
// (внутрішнє посилання модуля), і підміна однієї лише функції до запиту не дійшла б
vi.mock('@/entities/note/api/notesApi', () => {
  const fetchNotes = vi.fn(async () => structuredClone(db.notes))
  return {
    fetchNotes,
    notesQueryOptions: { queryKey: ['notes'], queryFn: () => fetchNotes() },
    noteKeys: { all: ['notes'] },
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  }
})

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
  updateApplicationReminder: vi.fn(async (id: string, remindAt: string | null) => {
    const row = db.rows.find((item) => item.id === id)!
    row.remindAt = remindAt ?? undefined
    if (!remindAt) row.remindNote = undefined
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
  // Перша сторінка вантажить lazy-модулі (AppLayout, BoardPage): у паралельному прогоні всіх тестів
  // це буває довше за стандартну 1 с очікування findBy — даємо запас
  await screen.findByRole('heading', { name: 'Дошка', level: 1 }, { timeout: 5000 })
  return view
}

describe('Дошка (інтеграційно: увесь застосунок)', () => {
  beforeEach(() => {
    db.rows = structuredClone(seed)
    db.notes = []
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
    // Перевіряємо те, що ПОЧУЄ скрінрідер: текст у live-регіоні
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

  it('нагадування, що настало, з’являється на сторінці, а «Готово» його прибирає', async () => {
    db.rows[0] = { ...db.rows[0], remindAt: '2020-01-01T10:00:00.000Z', remindNote: 'Написати рекрутеру' }
    const { user } = await openBoard()

    const center = await screen.findByRole('region', { name: 'Нагадування' })
    expect(within(center).getByText('Написати рекрутеру')).toBeInTheDocument()

    await user.click(within(center).getByRole('button', { name: 'Готово' }))

    await waitFor(() => expect(screen.queryByRole('region', { name: 'Нагадування' })).not.toBeInTheDocument())
    expect(api.updateApplicationReminder).toHaveBeenCalledWith('a1', null)
  })

  it('нотатки: листочок висить у своїй колонці, а картка вакансії показує, скільки в неї нотаток', async () => {
    const at = '2026-10-09T09:00:00.000Z'
    db.notes = [
      { id: 'n1', text: 'Підготувати питання про стек', color: 'yellow', status: 'test', createdAt: at, updatedAt: at },
      { id: 'n2', text: 'Рекрутерка — Олена', color: 'paper', applicationId: 'a1', createdAt: at, updatedAt: at },
      { id: 'n3', text: 'Ще одна', color: 'mint', applicationId: 'a1', createdAt: at, updatedAt: at },
    ]
    await openBoard()

    expect(await within(column('Тестове')).findByText('Підготувати питання про стек')).toBeInTheDocument()
    const nebula = within(column('Відгукнувся')).getByText('Nebula Labs').closest('article')!
    expect(within(nebula).getByText(/2 нотатки/)).toBeInTheDocument()
  })
})
