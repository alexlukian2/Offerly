// Робота з датами в ЛОКАЛЬНОМУ часовому поясі користувача.
// Дні додаємо через setDate, а не мілісекундами: доба не завжди має 24 години
// (переведення годинника на літній/зимовий час).

export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

// Тиждень починається з понеділка (getDay(): 0 — неділя, 1 — понеділок, ...)
export function startOfWeek(date: Date): Date {
  const result = startOfDay(date)
  const daysSinceMonday = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - daysSinceMonday)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// "2026-10-05" за ЛОКАЛЬНИМ календарем. toISOString() тут не підходить: він дає дату в UTC,
// і в Україні опівночі 5 жовтня — це ще 4 жовтня за UTC.
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
