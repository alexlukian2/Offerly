import { describe, expect, it } from 'vitest'
import { applicationRowSchema, toApplicationRow } from './applicationRow'

const row = {
  id: 'f62eb2b5-2a10-4a8c-bbf9-3d3472aa1a60',
  company: 'Nebula Labs',
  position: 'Junior React Developer',
  status: 'applied',
  work_format: 'remote',
  salary: null,
  url: 'https://nebula.dev',
  created_at: '2026-10-01T09:00:00+00:00', // так дату повертає Postgres
}

describe('applicationRowSchema (відповідь сервера → вакансія)', () => {
  it('перетворює snake_case → camelCase, null → undefined і нормалізує дату', () => {
    expect(applicationRowSchema.parse(row)).toEqual({
      id: row.id,
      company: 'Nebula Labs',
      position: 'Junior React Developer',
      status: 'applied',
      workFormat: 'remote',
      salary: undefined,
      url: 'https://nebula.dev',
      createdAt: '2026-10-01T09:00:00.000Z',
    })
  })

  it.each([
    ['невідомий статус', { status: 'hired' }],
    ['відсутня компанія', { company: undefined }],
    ['некоректна дата', { created_at: 'вчора' }],
  ])('відхиляє рядок: %s', (_, patch) => {
    expect(applicationRowSchema.safeParse({ ...row, ...patch }).success).toBe(false)
  })
})

describe('toApplicationRow (вакансія → рядок для бази)', () => {
  it('перетворює undefined на null — інакше база не очистила б поле', () => {
    expect(
      toApplicationRow({
        company: 'X',
        position: 'Y',
        status: 'test',
        workFormat: 'office',
        salary: undefined,
        url: undefined,
      }),
    ).toEqual({ company: 'X', position: 'Y', status: 'test', work_format: 'office', salary: null, url: null })
  })
})
