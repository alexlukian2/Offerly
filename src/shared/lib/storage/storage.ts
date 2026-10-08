// Обгортки над localStorage, які ніколи не "роняють" застосунок.
// localStorage може бути недоступний (приватний режим, заборона cookies),
// переповнений, або містити зіпсований JSON — у всіх цих випадках просто працюємо далі.

export function readFromStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Немає місця або доступу — дані лишаться лише в пам'яті до перезавантаження
  }
}
