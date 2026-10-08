import { describe, expect, it } from 'vitest'
import type { Application, ApplicationStatus } from '@/entities/application'
import { buildFunnel } from './buildFunnel'

function withStatuses(...statuses: ApplicationStatus[]): Application[] {
  return statuses.map((status, index) => ({
    id: String(index),
    company: 'Company',
    position: 'Dev',
    status,
    workFormat: 'remote',
    createdAt: '2026-10-01T09:00:00.000Z',
  }))
}

describe('buildFunnel', () => {
  it('рахує вакансії, що дійшли ЩОНАЙМЕНШЕ до кожного етапу', () => {
    const stages = buildFunnel(withStatuses('applied', 'applied', 'test', 'interview', 'offer'))

    expect(stages.map((stage) => stage.count)).toEqual([5, 3, 2, 1])
  })

  it('не враховує "хочу відгукнутись", а відмови — лише на першому етапі', () => {
    const stages = buildFunnel(withStatuses('wishlist', 'rejected', 'applied'))

    expect(stages.map((stage) => stage.count)).toEqual([2, 0, 0, 0])
  })

  it('рахує конверсію від попереднього етапу', () => {
    const stages = buildFunnel(withStatuses('applied', 'applied', 'test', 'interview'))

    expect(stages[0].conversion).toBeNull()
    expect(stages[1].conversion).toBeCloseTo(2 / 4) // toBeCloseTo — для дробових чисел
    expect(stages[2].conversion).toBeCloseTo(1 / 2)
  })

  it('не повертає NaN, коли ділити нема на що', () => {
    const stages = buildFunnel([])

    for (const stage of stages) {
      expect(stage.shareOfStart).toBe(0)
      expect(Number.isNaN(stage.conversion)).toBe(false)
    }
  })
})
