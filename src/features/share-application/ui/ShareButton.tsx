import { Share2 } from 'lucide-react'
import { useDisclosure } from '@/shared/lib/use-disclosure'
import { Button } from '@/shared/ui/button'
import { ShareModal } from './ShareModal'

type ShareButtonProps = {
  applicationId: string | null
  className?: string
}

export function ShareButton({ applicationId, className }: ShareButtonProps) {
  const dialog = useDisclosure()

  return (
    <>
      <Button variant="ghost" onClick={dialog.open} className={className}>
        <Share2 size={16} />
        Поділитися
      </Button>
      {dialog.isOpen && <ShareModal applicationId={applicationId} onClose={dialog.close} />}
    </>
  )
}
