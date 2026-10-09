import { Modal } from '@/shared/ui/modal'
import { ShareDialog } from './ShareDialog'

type ShareModalProps = {
  // null — ділимось усією дошкою, id — однією вакансією
  applicationId: string | null
  onClose: () => void
}

// Окремо від кнопки: вікно можна відкрити і з меню "⋯" на телефоні, а не лише кнопкою
export function ShareModal({ applicationId, onClose }: ShareModalProps) {
  return (
    <Modal
      title={applicationId === null ? 'Поділитися дошкою' : 'Поділитися вакансією'}
      onClose={onClose}
      size="sm"
    >
      <ShareDialog applicationId={applicationId} />
    </Modal>
  )
}
