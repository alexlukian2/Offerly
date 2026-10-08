// Promise, що виконається через ms мілісекунд. await wait(500) — "почекати пів секунди"
export function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
