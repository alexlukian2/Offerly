import { APPLICATION_STATUSES, type ApplicationStatus } from '@/entities/application'

export type MoveDirection = 'prev' | 'next'

export function getAdjacentStatus(
  status: ApplicationStatus,
  direction: MoveDirection,
): ApplicationStatus | undefined {
  const index = APPLICATION_STATUSES.indexOf(status)
  const adjacentIndex = direction === 'next' ? index + 1 : index - 1

  return APPLICATION_STATUSES[adjacentIndex]
}
