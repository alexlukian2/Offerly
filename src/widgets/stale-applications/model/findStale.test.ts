import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import { findStale } from './findStale'

const now = new Date('2026-10-09T12:00:00Z')

function app(id: string, status: Application['status'], daysAgo: number, changedDaysAgo?: number): Application {
  const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()
  return {
    id, company: id, position: 'Dev', status, workFormat: 'remote',
    createdAt: ago(daysAgo),
    statusChangedAt: changedDaysAgo === undefined ? undefined : ago(changedDaysAgo),
  }
}

describe('findStale', () => {
  it('лише етапи очікування без руху ≥ 14 днів, від найдавнішої', () => {
    const result = findStale(
      [
        app('fresh', 'applied', 30, 3), // етап змінився 3 дні тому — свіжа
        app('old', 'applied', 40, 20),
        app('older', 'interview', 50, 30),
        app('no-date', 'test', 15), // дати зміни немає → беремо дату створення
        app('offer', 'offer', 90, 90), // на офері чекати нічого
        app('wish', 'wishlist', 90),
      ],
      now,
    )
    expect(result.map(({ application, days }) => [application.id, days])).toEqual([
      ['older', 30],
      ['old', 20],
      ['no-date', 15],
    ])
  })
})
