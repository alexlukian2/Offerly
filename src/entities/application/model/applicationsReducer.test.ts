import { describe, expect, it } from 'vitest'
import { applicationsReducer } from './applicationsReducer'
import type { Application } from './types'

// Мінімальна "фабрика" тестових даних: задаємо лише те, що важливо для конкретного тесту
function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'a1',
    company: 'Nebula Labs',
    position: 'Frontend Developer',
    status: 'applied',
    workFormat: 'remote',
    createdAt: '2026-10-01T09:00:00.000Z',
    ...overrides,
  }
}

describe('applicationsReducer', () => {
  const first = makeApplication({ id: 'a1' })
  const second = makeApplication({ id: 'a2', company: 'Pixelforge' })
  const state = [first, second]

  it('added: додає нову вакансію на початок', () => {
    const added = makeApplication({ id: 'a3', company: 'Orbita' })

    const result = applicationsReducer(state, { type: 'added', application: added })

    expect(result.map((application) => application.id)).toEqual(['a3', 'a1', 'a2'])
  })

  it('moved: змінює статус лише потрібної вакансії', () => {
    const result = applicationsReducer(state, { type: 'moved', id: 'a2', status: 'offer' })

    expect(result[1].status).toBe('offer')
    expect(result[0].status).toBe('applied')
  })

  it('moved: незмінені вакансії лишаються ТИМИ САМИМИ об’єктами (на цьому тримається memo)', () => {
    const result = applicationsReducer(state, { type: 'moved', id: 'a2', status: 'offer' })

    expect(result[0]).toBe(first) // toBe — порівняння через ===, тобто "той самий об'єкт"
    expect(result[1]).not.toBe(second) // змінена — новий об'єкт
  })

  it('не змінює вхідний масив і об’єкти (іммутабельність)', () => {
    const snapshot = structuredClone(state)

    applicationsReducer(state, { type: 'moved', id: 'a1', status: 'test' })
    applicationsReducer(state, { type: 'deleted', id: 'a2' })

    expect(state).toEqual(snapshot) // toEqual — порівняння вмісту
  })

  it('updated: замінює вакансію з тим самим id', () => {
    const updated = { ...second, salary: '$2000' }

    const result = applicationsReducer(state, { type: 'updated', application: updated })

    expect(result[1]).toEqual(updated)
  })

  it('deleted: прибирає вакансію', () => {
    const result = applicationsReducer(state, { type: 'deleted', id: 'a1' })

    expect(result).toEqual([second])
  })

  it('replaced: повністю замінює список', () => {
    const fromOtherTab = [makeApplication({ id: 'x' })]

    expect(applicationsReducer(state, { type: 'replaced', applications: fromOtherTab })).toBe(
      fromOtherTab,
    )
  })
})
