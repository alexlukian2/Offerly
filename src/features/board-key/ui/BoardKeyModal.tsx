import { useMutation } from '@tanstack/react-query'
import { Copy, KeyRound, ShieldCheck } from 'lucide-react'
import { createBoardKey } from '@/shared/api'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'
import { useToast } from '@/shared/ui/toast'
import { RestoreBoardForm } from './RestoreBoardForm'
import styles from './BoardKey.module.css'

type BoardKeyModalProps = {
  onClose: () => void
}

// Ключ дошки — тимчасова заміна входу через пошту: зберіг ключ — і дошку можна відкрити
// в іншому браузері чи після очищення кешу
export function BoardKeyModal({ onClose }: BoardKeyModalProps) {
  const showToast = useToast()
  const create = useMutation({ mutationFn: createBoardKey })
  const key = create.data

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      showToast({ message: 'Ключ скопійовано — збережи його в надійному місці' })
    } catch {
      showToast({ variant: 'error', message: 'Не вдалося скопіювати — виділи ключ вручну' })
    }
  }

  return (
    <Modal title="Ключ дошки" onClose={onClose} size="sm">
      <div className={styles.dialog}>
        <div className={styles.intro}>
          <span className={styles.badge} aria-hidden="true">
            <KeyRound size={22} />
          </span>
          <p className={styles.lead}>Не загуби свою дошку</p>
          <p className={styles.text}>
            Дошка прив’язана до цього браузера. Збережи ключ — і зможеш відкрити її в іншому
            браузері, на іншому пристрої чи після очищення кешу.
          </p>
        </div>

        {key ? (
          <div className={styles.result}>
            <p className={styles.keyBox} aria-label="Твій ключ дошки">
              {key}
            </p>
            <Button onClick={() => void copy(key)}>
              <Copy size={16} />
              Копіювати ключ
            </Button>
            <p className={styles.warning}>
              <ShieldCheck size={14} aria-hidden="true" />
              Ключ показується лише зараз. Хто знає ключ — має доступ до дошки, тож не пересилай
              його іншим.
            </p>
          </div>
        ) : (
          <div className={styles.result}>
            <Button
              aria-disabled={create.isPending || undefined}
              onClick={() => !create.isPending && create.mutate()}
            >
              <KeyRound size={16} />
              {create.isPending ? 'Створюємо…' : 'Створити ключ'}
            </Button>
            <p className={styles.hint}>
              Якщо ключ уже був — новий замінить його: старий перестане діяти, а інші браузери з цією дошкою попросять новий ключ.
            </p>
            {create.isError && (
              <p className={styles.error} role="alert">
                {getErrorMessage(create.error)}
              </p>
            )}
          </div>
        )}

        <details className={styles.other}>
          <summary>Маю ключ від іншої дошки</summary>
          <p className={styles.hint}>
            Цей браузер перейде на ту дошку. Поточна лишиться в базі — повернутися на неї можна її
            ключем.
          </p>
          <RestoreBoardForm />
        </details>
      </div>
    </Modal>
  )
}
