import { useMutation } from '@tanstack/react-query'
import { CircleCheck, Link2 } from 'lucide-react'
import { useId, useState, type ClipboardEvent, type FormEvent } from 'react'
import { WORK_FORMAT_LABELS, type ApplicationFormValues } from '@/entities/application'
import { getErrorMessage } from '@/shared/lib/errors'
import { Input } from '@/shared/ui/form'
import { SubmitButton } from '@/shared/ui/submit-button'
import { parseVacancyUrl, type VacancyDraft } from '../api/parseVacancyUrl'
import styles from './VacancyAutofill.module.css'

type VacancyAutofillProps = {
  // Віддає значення для полів форми вакансії
  onFill: (values: Partial<ApplicationFormValues>) => void
}

export function VacancyAutofill({ onFill }: VacancyAutofillProps) {
  const inputId = useId()
  const [url, setUrl] = useState('')

  // Не useQuery: це не "дані, які показуємо", а дія на вимогу користувача — як відправка форми
  const { mutate, isPending, isSuccess, isError, error, data, reset } = useMutation({
    mutationFn: (link: string) => parseVacancyUrl(link),
    onSuccess: (draft) => onFill(draftToFormValues(draft)),
  })

  function start(link: string) {
    const trimmed = link.trim()
    if (trimmed && !isPending) mutate(trimmed)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    start(url)
  }

  // Вставили посилання в порожнє поле — одразу запускаємо, без натискання кнопки
  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').trim()
    if (url === '' && /^https?:\/\/\S+$/.test(pasted)) {
      event.preventDefault()
      setUrl(pasted)
      start(pasted)
    }
  }

  return (
    // Окрема <form> ПОРУЧ із формою вакансії (вкладати форми не можна): Enter у цьому полі
    // запускає автозаповнення, а не збереження вакансії
    <form className={styles.panel} onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className={styles.label}>
        <Link2 size={16} aria-hidden="true" />
        Заповнити за посиланням
      </label>

      <div className={styles.row}>
        <Input
          id={inputId}
          type="url"
          inputMode="url"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value)
            if (isError || isSuccess) reset() // старий результат більше не стосується нового посилання
          }}
          onPaste={handlePaste}
          placeholder="https://jobs.dou.ua/… або https://djinni.co/…"
          aria-describedby={`${inputId}-status`}
          aria-invalid={isError || undefined}
          data-autofocus
        />
        <SubmitButton pending={isPending} pendingText="Шукаю…" variant="ghost">
          Заповнити
        </SubmitButton>
      </div>

      {/* Один live-регіон для всіх станів: скрінрідер прочитає результат, коли він з'явиться */}
      <p id={`${inputId}-status`} className={styles.status} role="status">
        {isPending && 'Читаю сторінку вакансії…'}
        {isError && <span className={styles.error}>{getErrorMessage(error)}</span>}
        {isSuccess && (
          <span className={styles.success}>
            <CircleCheck size={14} aria-hidden="true" />
            {describeFilled(data)}
          </span>
        )}
        {!isPending &&
          !isError &&
          !isSuccess &&
          'DOU, Djinni та сайти зі стандартною розміткою вакансій'}
      </p>
    </form>
  )
}

// Текстові поля перезаписуємо ЗАВЖДИ: не знайшли зарплату — поле порожнє. Інакше після другого
// посилання в формі лишилась би зарплата з попередньої вакансії. Формат — лише якщо його знайшли:
// "порожнього" варіанту в списку немає
function draftToFormValues(draft: VacancyDraft): Partial<ApplicationFormValues> {
  return {
    company: draft.company ?? '',
    position: draft.position ?? '',
    salary: draft.salary ?? '',
    url: draft.url,
    ...(draft.workFormat && { workFormat: draft.workFormat }),
  }
}

function describeFilled(draft: VacancyDraft) {
  const filled = [
    draft.company && 'компанію',
    draft.position && 'позицію',
    draft.workFormat && `формат (${WORK_FORMAT_LABELS[draft.workFormat]})`,
    draft.salary && 'зарплату',
  ].filter(Boolean)
  return `Заповнено ${filled.join(', ')} і посилання. Перевір поля перед збереженням.`
}
