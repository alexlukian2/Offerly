import { Trash2 } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  StatusDot,
  type ApplicationStatus,
} from '@/entities/application'
import { NOTE_COLOR_LABELS, NOTE_COLORS, NOTE_MAX_LENGTH, type Note, type NoteColor } from '@/entities/note'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { FormField } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { Select, type SelectOption } from '@/shared/ui/select'
import { SubmitButton } from '@/shared/ui/submit-button'
import { useNoteMutations } from '../model/useNoteMutations'
import styles from './NoteEditorModal.module.css'

const STATUS_OPTIONS: SelectOption<ApplicationStatus>[] = APPLICATION_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
  marker: <StatusDot status={status} />,
}))

type NoteEditorModalProps = {
  onClose: () => void
} & (
  | { note: Note; applicationId?: never; defaultStatus?: never } // редагування
  | { note?: never; applicationId: string; defaultStatus?: never } // нова нотатка до вакансії
  | { note?: never; applicationId?: never; defaultStatus?: ApplicationStatus } // нова нотатка на дошці
)

// Одне вікно і для створення, і для редагування. Нотатці на дошці можна обрати колонку,
// нотатці вакансії — ні (вона висить на своїй вакансії)
export function NoteEditorModal({ note, applicationId, defaultStatus, onClose }: NoteEditorModalProps) {
  const id = useId()
  const { create, update, remove } = useNoteMutations()
  const [text, setText] = useState(note?.text ?? '')
  const [color, setColor] = useState<NoteColor>(note?.color ?? 'yellow')
  const [status, setStatus] = useState<ApplicationStatus>(note?.status ?? defaultStatus ?? 'applied')
  const [error, setError] = useState<string | null>(null)

  const isBoardNote = note ? note.status !== undefined : applicationId === undefined
  const isPending = create.isPending || update.isPending || remove.isPending

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Напиши хоч кілька слів')
      return
    }
    try {
      if (note) {
        await update.mutateAsync({
          id: note.id,
          changes: { text: trimmed, color, ...(isBoardNote && { status }) },
        })
      } else {
        await create.mutateAsync({
          text: trimmed,
          color,
          place: applicationId ? { applicationId } : { status },
        })
      }
      onClose()
    } catch {
      // Повідомлення вже показав тост (useNoteMutations); вікно лишаємо відкритим — текст не губиться
    }
  }

  async function handleDelete() {
    if (!note) return
    await remove.mutateAsync(note.id).then(onClose, () => {})
  }

  return (
    <Modal title={note ? 'Нотатка' : 'Нова нотатка'} onClose={onClose} size="sm">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Поле — той самий папір у клітинку, що й нотатка на дошці: пишеш "на листочку" */}
        <FormField label="Текст" htmlFor={`${id}-text`} error={error ?? undefined}>
          <textarea
            id={`${id}-text`}
            className={styles.sheet}
            data-color={color}
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError(null)
            }}
            maxLength={NOTE_MAX_LENGTH}
            rows={6}
            placeholder="Питання до співбесіди, ім’я рекрутера, що підготувати…"
            aria-invalid={error ? true : undefined}
            data-autofocus
          />
        </FormField>
        <p className={styles.counter} aria-live="polite">
          {text.length} / {NOTE_MAX_LENGTH}
        </p>

        <fieldset className={styles.colors}>
          <legend>Колір паперу</legend>
          {NOTE_COLORS.map((value) => (
            <label
              key={value}
              className={cn(styles.swatch, color === value && styles.chosen)}
              data-color={value}
            >
              <input
                type="radio"
                name={`${id}-color`}
                value={value}
                checked={color === value}
                onChange={() => setColor(value)}
                className="visually-hidden"
              />
              <span className="visually-hidden">{NOTE_COLOR_LABELS[value]}</span>
            </label>
          ))}
        </fieldset>

        {isBoardNote && (
          <FormField label="Колонка на дошці" htmlFor={`${id}-status`}>
            <Select
              id={`${id}-status`}
              value={status}
              onValueChange={setStatus}
              options={STATUS_OPTIONS}
            />
          </FormField>
        )}

        <div className={styles.footer}>
          {note && (
            <Button variant="dangerSoft" onClick={handleDelete} aria-disabled={isPending || undefined}>
              <Trash2 size={16} />
              Видалити
            </Button>
          )}
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onClose}>
              Скасувати
            </Button>
            <SubmitButton pending={create.isPending || update.isPending} pendingText="Зберігаємо…">
              {note ? 'Зберегти' : 'Прикріпити'}
            </SubmitButton>
          </div>
        </div>
      </form>
    </Modal>
  )
}

