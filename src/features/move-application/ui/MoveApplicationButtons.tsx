import { ChevronLeft, ChevronRight } from 'lucide-react'
import { STATUS_LABELS, type Application } from '@/entities/application'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/ui/icon-button'
import { Spinner } from '@/shared/ui/spinner'
import { getAdjacentStatus } from '../model/getAdjacentStatus'
import { useMoveApplication } from '../model/useMoveApplication'
import styles from './MoveApplicationButtons.module.css'

type MoveApplicationButtonsProps = {
  application: Application
}

export function MoveApplicationButtons({ application }: MoveApplicationButtonsProps) {
  const { move, isPending } = useMoveApplication()

  const prevStatus = getAdjacentStatus(application.status, 'prev')
  const nextStatus = getAdjacentStatus(application.status, 'next')

  return (
    <div className={cn(styles.buttons, isPending && styles.pending)} aria-busy={isPending}>
      {isPending && <Spinner size={14} />}
      <IconButton
        label={prevStatus ? `Перемістити в «${STATUS_LABELS[prevStatus]}»` : 'Це перший етап'}
        disabled={!prevStatus || isPending}
        onClick={() => prevStatus && move(application, prevStatus)}
      >
        <ChevronLeft size={18} />
      </IconButton>
      <IconButton
        label={nextStatus ? `Перемістити в «${STATUS_LABELS[nextStatus]}»` : 'Це останній етап'}
        disabled={!nextStatus || isPending}
        onClick={() => nextStatus && move(application, nextStatus)}
      >
        <ChevronRight size={18} />
      </IconButton>
    </div>
  )
}
