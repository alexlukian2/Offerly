import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import { applyFilters, DEFAULT_FILTERS, parseFilters } from './filters'

const applications: Application[] = [
  { id: '1', company: 'Pixelforge', position: 'Frontend Developer', status: 'applied', workFormat: 'office', createdAt: '2026-10-02T09:00:00.000Z' },
  { id: '2', company: 'Єдина Компанія', position: 'React Engineer', status: 'test', workFormat: 'remote', createdAt: '2026-09-28T09:00:00.000Z' },
  { id: '3', company: 'Brightloop', position: 'Junior Frontend', status: 'interview', workFormat: 'remote', createdAt: '2026-10-05T09:00:00.000Z' },
]

const ids = (list: Application[]) => list.map((application) => application.id)

describe('parseFilters', () => {
  it('читає валідні параметри з адреси', () => {
    expect(parseFilters(new URLSearchParams('q=react&format=remote&sort=oldest'))).toEqual({
      query: 'react',
      format: 'remote',
      sort: 'oldest',
    })
  })

  it('замінює некоректні значення дефолтними', () => {
    expect(parseFilters(new URLSearchParams('format=bogus&sort=zzz'))).toEqual(DEFAULT_FILTERS)
  })
})

describe('applyFilters', () => {
  it('шукає без урахування регістру — і в компанії, і в позиції', () => {
    expect(ids(applyFilters(applications, { ...DEFAULT_FILTERS, query: 'FRONTEND' }))).toEqual([
      '3',
      '1',
    ])
  })

  it('фільтрує за форматом роботи', () => {
    expect(ids(applyFilters(applications, { ...DEFAULT_FILTERS, format: 'remote' }))).toEqual([
      '3',
      '2',
    ])
  })

  it('сортує за датою в обидва боки', () => {
    expect(ids(applyFilters(applications, { ...DEFAULT_FILTERS, sort: 'newest' }))).toEqual(['3', '1', '2'])
    expect(ids(applyFilters(applications, { ...DEFAULT_FILTERS, sort: 'oldest' }))).toEqual(['2', '1', '3'])
  })

  it('сортує назви за українською абеткою, а не за кодами символів', () => {
    const companies = ['Єдина', 'Дельта', 'Ґрунт', 'Їжак'].map((company, index) => ({
      ...applications[0],
      id: String(index),
      company,
    }))

    const sorted = applyFilters(companies, { ...DEFAULT_FILTERS, sort: 'company' })

    // Абетка: Г Ґ Д Е Є Ж ... І Ї. Наївне a < b дало б Є, Д, Ґ, Ї — за кодами Unicode
    expect(sorted.map((application) => application.company)).toEqual([
      'Ґрунт',
      'Дельта',
      'Єдина',
      'Їжак',
    ])
  })

  it('з локаллю uk-UA кирилиця йде перед латиницею', () => {
    expect(ids(applyFilters(applications, { ...DEFAULT_FILTERS, sort: 'company' }))).toEqual([
      '2', // Єдина Компанія
      '3', // Brightloop
      '1', // Pixelforge
    ])
  })

  it('не змінює вхідний масив (toSorted, а не sort)', () => {
    const before = ids(applications)

    applyFilters(applications, { ...DEFAULT_FILTERS, sort: 'company' })

    expect(ids(applications)).toEqual(before)
  })
})
