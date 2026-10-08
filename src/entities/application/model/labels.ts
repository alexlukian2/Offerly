import type { ApplicationStatus, WorkFormat } from './types'

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist: 'Хочу відгукнутись',
  applied: 'Відгукнувся',
  test: 'Тестове',
  interview: 'Інтерв’ю',
  offer: 'Офер',
  rejected: 'Відмова',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  wishlist: 'var(--color-status-wishlist)',
  applied: 'var(--color-status-applied)',
  test: 'var(--color-status-test)',
  interview: 'var(--color-status-interview)',
  offer: 'var(--color-status-offer)',
  rejected: 'var(--color-status-rejected)',
}

export const WORK_FORMAT_LABELS: Record<WorkFormat, string> = {
  remote: 'Remote',
  office: 'Офіс',
  hybrid: 'Гібрид',
}
