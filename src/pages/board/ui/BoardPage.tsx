import { Eye, EyeOff, SearchX, Share2, SquareKanban } from 'lucide-react'
import { useMemo } from 'react'
import { useApplications, type ApplicationStatus } from '@/entities/application'
import { AddApplication } from '@/features/add-application'
import {
  ApplicationFilters,
  applyFilters,
  useApplicationFilters,
} from '@/features/filter-applications'
import { ShareModal } from '@/features/share-application'
import { useLocalStorage } from '@/shared/lib/storage'
import { useDisclosure } from '@/shared/lib/use-disclosure'
import { ActionsMenu } from '@/shared/ui/actions-menu'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { ApplicationBoard } from '@/widgets/application-board'
import styles from './BoardPage.module.css'

// Константа поза компонентом — той самий масив на кожен рендер
const REJECTED_COLUMN: ApplicationStatus[] = ['rejected']

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function BoardPage() {
  const applications = useApplications()
  const { filters, resetFilters } = useApplicationFilters()
  const [showRejected, setShowRejected] = useLocalStorage(
    'offerly:board:show-rejected',
    true,
    isBoolean,
  )
  const share = useDisclosure()
  const toggleRejected = () => setShowRejected((current) => !current)

  // Похідні дані: не зберігаємо відфільтрований список у state, а обчислюємо.
  // useMemo — щоб не перераховувати, якщо ні список, ні фільтри не змінились.
  const filteredApplications = useMemo(
    () => applyFilters(applications, filters),
    [applications, filters],
  )

  function renderContent() {
    if (applications.length === 0) {
      return (
        <EmptyState
          icon={SquareKanban}
          title="Тут з’явиться твоя дошка"
          description="Додай першу вакансію, на яку відгукнувся, — і переміщай її між етапами: від відгуку до оферу."
        />
      )
    }

    if (filteredApplications.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="Нічого не знайдено"
          description="Жодна вакансія не відповідає фільтрам. Спробуй змінити запит або формат роботи."
          action={<Button onClick={resetFilters}>Скинути фільтри</Button>}
        />
      )
    }

    return (
      <ApplicationBoard
        applications={filteredApplications}
        hiddenStatuses={showRejected ? [] : REJECTED_COLUMN}
      />
    )
  }

  return (
    <div className={styles.page}>
      <title>Дошка — Offerly</title>
      <PageHeader
        title="Дошка"
        description="Усі твої вакансії за етапами відбору."
        actions={
          <>
            {/* Десктоп: другорядні дії — окремими кнопками */}
            <div className={styles.secondaryActions}>
              <Button variant="ghost" onClick={toggleRejected}>
                {showRejected ? <EyeOff size={18} /> : <Eye size={18} />}
                {showRejected ? 'Сховати відмови' : 'Показати відмови'}
              </Button>
              <Button variant="ghost" onClick={share.open}>
                <Share2 size={18} />
                Поділитися
              </Button>
            </div>
            {/* Телефон: ті самі дії сховані за "⋯" — на екрані лишається лише головна */}
            <ActionsMenu
              className={styles.menu}
              label="Ще дії з дошкою"
              items={[
                {
                  label: showRejected ? 'Сховати відмови' : 'Показати відмови',
                  icon: showRejected ? EyeOff : Eye,
                  onSelect: toggleRejected,
                },
                { label: 'Поділитися дошкою', icon: Share2, onSelect: share.open },
              ]}
            />
            <AddApplication />
          </>
        }
      />

      {applications.length > 0 && (
        <ApplicationFilters
          resultCount={filteredApplications.length}
          totalCount={applications.length}
        />
      )}

      {renderContent()}

      {share.isOpen && <ShareModal applicationId={null} onClose={share.close} />}
    </div>
  )
}
