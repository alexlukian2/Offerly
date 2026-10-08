import type { Application, ApplicationStatus } from '@/entities/application'

export const FUNNEL_STAGES = [
  'applied',
  'test',
  'interview',
  'offer',
] as const satisfies readonly ApplicationStatus[]

type FunnelStatus = (typeof FUNNEL_STAGES)[number]

// Наскільки далеко просунулась вакансія: індекс найдальшого етапу воронки, якого вона досягла.
//  -1 — ще не відгукувався.
// Для відмови ми не знаємо, на якому етапі її отримали (історію статусів не зберігаємо),
// тож гарантовано можемо сказати лише одне: відгук було надіслано.
const STAGE_REACHED: Record<ApplicationStatus, number> = {
  wishlist: -1,
  applied: 0,
  rejected: 0,
  test: 1,
  interview: 2,
  offer: 3,
}

export type FunnelStage = {
  status: FunnelStatus
  count: number
  // Частка від першого етапу (0..1) — для довжини смуги
  shareOfStart: number
  // Частка від попереднього етапу (0..1); для першого етапу — null
  conversion: number | null
}

function ratio(part: number, whole: number) {
  return whole === 0 ? 0 : part / whole
}

export function buildFunnel(applications: Application[]): FunnelStage[] {
  const counts = FUNNEL_STAGES.map(
    (_, stageIndex) =>
      applications.filter((application) => STAGE_REACHED[application.status] >= stageIndex).length,
  )
  const startCount = counts[0]

  return FUNNEL_STAGES.map((status, index) => ({
    status,
    count: counts[index],
    shareOfStart: ratio(counts[index], startCount),
    conversion: index === 0 ? null : ratio(counts[index], counts[index - 1]),
  }))
}
