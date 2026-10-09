import { describe, expect, it } from 'vitest'
import {
  applicationFormSchema,
  emptyFormValues,
  toFormValues,
  type ApplicationFormValues,
} from './applicationForm'
import type { Application } from './types'

const validValues: ApplicationFormValues = {
  ...emptyFormValues,
  company: 'Nebula Labs',
  position: 'Frontend Developer',
}

// Допоміжна: повідомлення про помилку конкретного поля (або undefined)
function errorFor(values: ApplicationFormValues, field: keyof ApplicationFormValues) {
  const result = applicationFormSchema.safeParse(values)
  return result.success ? undefined : result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('applicationFormSchema: перевірка', () => {
  it('вимагає компанію і позицію', () => {
    expect(errorFor(emptyFormValues, 'company')).toBe('Вкажи назву компанії')
    expect(errorFor(emptyFormValues, 'position')).toBe('Вкажи позицію')
  })

  it('вважає пробіли порожнім значенням', () => {
    expect(errorFor({ ...validValues, company: '   ' }, 'company')).toBeDefined()
  })

  it.each(['nebula.dev', 'ftp://nebula.dev', 'javascript:alert(1)'])(
    'відхиляє некоректне посилання "%s"',
    (url) => {
      expect(errorFor({ ...validValues, url }, 'url')).toBe(
        'Посилання має починатися з http:// або https://',
      )
    },
  )

  it('відхиляє невідомий статус (дані з DOM не довіряємо)', () => {
    const tampered = { ...validValues, status: 'hacked' } as unknown as ApplicationFormValues
    expect(applicationFormSchema.safeParse(tampered).success).toBe(false)
  })
})

describe('applicationFormSchema: перетворення', () => {
  it('обрізає пробіли і перетворює порожні необов’язкові поля на undefined', () => {
    const output = applicationFormSchema.parse({
      ...validValues,
      company: '  Nebula Labs  ',
      salary: '   ',
      url: ' https://nebula.dev/jobs ',
    })

    expect(output).toEqual({
      company: 'Nebula Labs',
      position: 'Frontend Developer',
      status: 'applied',
      workFormat: 'remote',
      salary: undefined,
      url: 'https://nebula.dev/jobs',
    })
  })

  it('вакансія → форма → схема дає ті самі дані', () => {
    const application: Application = {
      id: 'a1',
      company: 'Nebula Labs',
      position: 'Dev',
      status: 'test',
      workFormat: 'hybrid',
      salary: '$1500',
      createdAt: '2026-10-01T09:00:00.000Z',
    }

    expect(applicationFormSchema.parse(toFormValues(application))).toMatchObject({
      company: 'Nebula Labs',
      status: 'test',
      salary: '$1500',
      url: undefined,
    })
  })

  it('нагадування: місцевий час → ISO, минулий час — помилка, нотатка без часу відкидається', () => {
    const tomorrow = new Date(Date.now() + 86_400_000)
    const local = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16)

    const withReminder = applicationFormSchema.parse({ ...validValues, remindAt: local, remindNote: ' Подзвонити ' })
    expect(withReminder.remindAt).toBe(new Date(local).toISOString())
    expect(withReminder.remindNote).toBe('Подзвонити')

    expect(errorFor({ ...validValues, remindAt: '2020-01-01T10:00' }, 'remindAt')).toBe(
      'Цей час уже минув — обери майбутній',
    )
    expect(applicationFormSchema.parse({ ...validValues, remindNote: 'Без часу' }).remindNote).toBeUndefined()
  })
})
