import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Eye, Link2Off, Lock, Send, Share2, Zap } from 'lucide-react'
import { useId } from 'react'
import { createShare, deleteShare, shareIdQueryOptions, shareKeys } from '@/entities/application'
import { getSharePath } from '@/shared/config/routes'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/form'
import { Spinner } from '@/shared/ui/spinner'
import { useToast } from '@/shared/ui/toast'
import styles from './ShareDialog.module.css'

type ShareDialogProps = {
  applicationId: string | null
}

// Повна адреса для гостя: origin — домен, на якому відкрито застосунок (localhost або vercel.app)
function toShareUrl(shareId: string) {
  return `${window.location.origin}${getSharePath(shareId)}`
}

export function ShareDialog({ applicationId }: ShareDialogProps) {
  const queryClient = useQueryClient()
  const showToast = useToast()
  const inputId = useId()
  const isBoard = applicationId === null

  // Чи є вже посилання — звичайний useQuery (не Suspense): поки вантажиться, вікно вже відкрите
  const shareQuery = useQuery(shareIdQueryOptions(applicationId))
  const shareId = shareQuery.data ?? null
  const queryKey = shareKeys.owner(applicationId)

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      showToast({ message: 'Посилання скопійовано' })
    } catch {
      // Буфер обміну недоступний (наприклад, сторінка не на https) — посилання видно в полі, його можна виділити
      showToast({ variant: 'error', message: 'Не вдалося скопіювати — виділи посилання в полі' })
    }
  }

  const create = useMutation({
    mutationFn: () => createShare(applicationId),
    onSuccess: (id) => {
      // Кладемо новий id прямо в кеш: ми точно знаємо результат, перезапитувати не треба
      queryClient.setQueryData(queryKey, id)
      void copy(toShareUrl(id))
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteShare(id),
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null)
      showToast({ message: 'Посилання вимкнено — за ним більше нічого не відкриється' })
    },
  })

  const error = shareQuery.error ?? create.error ?? remove.error

  if (shareQuery.isPending) {
    return (
      <div className={styles.loading}>
        <Spinner size={20} />
      </div>
    )
  }

  const url = shareId ? toShareUrl(shareId) : null
  // Web Share API: системне меню "Поділитися" (месенджери, пошта) — є на телефонах і частині браузерів
  const canNativeShare = typeof navigator.share === 'function'

  return (
    <div className={styles.dialog}>
      {/* Голографічна "картка" зверху: іконка і три короткі факти замість абзацу тексту */}
      <div className={styles.intro}>
        <span className={styles.badge} aria-hidden="true">
          <Share2 size={22} />
        </span>
        <p className={styles.lead}>
          {isBoard ? 'Покажи свою дошку будь-кому' : 'Покажи цю вакансію будь-кому'}
        </p>
        <ul className={styles.facts}>
          <li>
            <Eye size={14} aria-hidden="true" />
            Без входу
          </li>
          <li>
            <Lock size={14} aria-hidden="true" />
            Лише перегляд
          </li>
          <li>
            <Zap size={14} aria-hidden="true" />
            Зміни видно одразу
          </li>
        </ul>
      </div>

      {url ? (
        <>
          <p className={styles.status}>
            <span className={styles.live} aria-hidden="true" />
            Посилання активне
          </p>
          <label htmlFor={inputId} className="visually-hidden">
            Посилання
          </label>
          <div className={styles.linkRow}>
            <Input
              id={inputId}
              value={url}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
              className={styles.link}
            />
            <Button onClick={() => void copy(url)}>
              <Copy size={16} />
              Копіювати
            </Button>
          </div>

          <div className={styles.secondary}>
            {canNativeShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  // Користувач закрив системне меню — це не помилка, тож catch порожній
                  navigator.share({ title: 'Offerly', url }).catch(() => {})
                }
              >
                <Send size={14} />
                Надіслати…
              </Button>
            )}
            <Button
              variant="dangerSoft"
              size="sm"
              aria-disabled={remove.isPending || undefined}
              onClick={() => shareId && !remove.isPending && remove.mutate(shareId)}
            >
              <Link2Off size={14} />
              Вимкнути посилання
            </Button>
          </div>
        </>
      ) : (
        <Button
          aria-disabled={create.isPending || undefined}
          onClick={() => !create.isPending && create.mutate()}
          className={styles.create}
        >
          {create.isPending ? <Spinner size={16} /> : null}
          {create.isPending ? 'Створюємо…' : 'Створити посилання'}
        </Button>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {getErrorMessage(error)}
        </p>
      )}
    </div>
  )
}
