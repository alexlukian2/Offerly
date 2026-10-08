// Власний клас помилки: за ним легко відрізнити "немає мережі" від будь-якої іншої помилки
export class NetworkError extends Error {
  constructor(message = 'Немає з’єднання з сервером') {
    super(message)
    this.name = 'NetworkError'
  }
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

// Не вдалося завантажити chunk коду (lazy-сторінку) — зазвичай через відсутність мережі
// або через те, що після нового деплою старих файлів на сервері вже немає
export function isChunkLoadError(error: unknown) {
  return (
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(
      error.message,
    )
  )
}

// catch отримує unknown: кинути можна що завгодно, навіть рядок. Дістаємо текст безпечно
export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Невідома помилка'
}
