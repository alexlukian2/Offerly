import { describe, expect, it } from 'vitest'
import { plural, pluralWord, WORDS } from './plural'

describe('plural', () => {
  it.each([
    [1, '1 день'],
    [2, '2 дні'],
    [5, '5 днів'],
    [11, '11 днів'],
    [14, '14 днів'],
    [21, '21 день'],
    [22, '22 дні'],
    [0, '0 днів'],
  ])('%i → %s', (count, expected) => {
    expect(plural(count, WORDS.day)).toBe(expected)
  })

  it('лише слово', () => {
    expect(pluralWord(12, WORDS.note)).toBe('нотаток')
    expect(pluralWord(3, WORDS.vacancy)).toBe('вакансії')
  })
})
