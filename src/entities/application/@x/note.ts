// Перехресний публічний API (FSD "@x"): що сутність application дозволяє брати сутності note.
// Звичайні сутності одна одну не імпортують; @x робить такий зв'язок явним і вузьким
export { APPLICATION_STATUSES } from '../model/types'
export type { ApplicationStatus } from '../model/types'
