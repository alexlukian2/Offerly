// Українські форми числа: 1 день, 2 дні, 5 днів, 11 днів, 21 день.
// Правила (зокрема 11–14 і 21) знає Intl.PluralRules — вручну їх легко помилитися
const rules = new Intl.PluralRules('uk')

export type PluralForms = readonly [one: string, few: string, many: string]

export const WORDS = {
  day: ['день', 'дні', 'днів'],
  feedback: ['відгук', 'відгуки', 'відгуків'],
  vacancy: ['вакансія', 'вакансії', 'вакансій'],
  note: ['нотатка', 'нотатки', 'нотаток'],
} as const satisfies Record<string, PluralForms>

// Лише слово: pluralWord(5, WORDS.day) → "днів"
export function pluralWord(count: number, [one, few, many]: PluralForms) {
  const rule = rules.select(count)
  return rule === 'one' ? one : rule === 'few' ? few : many
}

// Число зі словом: plural(21, WORDS.day) → "21 день"
export function plural(count: number, forms: PluralForms) {
  return `${count} ${pluralWord(count, forms)}`
}
