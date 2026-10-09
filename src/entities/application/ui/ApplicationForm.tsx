import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { getErrorMessage, isNetworkError } from '@/shared/lib/errors'
import { Button } from '@/shared/ui/button'
import { FormField, getErrorId, Input } from '@/shared/ui/form'
import { Select, type SelectOption } from '@/shared/ui/select'
import { SubmitButton } from '@/shared/ui/submit-button'
import type { ApplicationInput } from '../api/applicationRow'
import {
  applicationFormSchema,
  emptyFormValues,
  type ApplicationFormErrors,
  type ApplicationFormValues,
} from '../model/applicationForm'
import { STATUS_LABELS, WORK_FORMAT_LABELS } from '../model/labels'
import {
  APPLICATION_STATUSES,
  WORK_FORMATS,
  type ApplicationStatus,
  type WorkFormat,
} from '../model/types'
import { ReminderSection } from './ReminderSection'
import { StatusDot } from './StatusDot'
import styles from './ApplicationForm.module.css'

type FieldName = keyof ApplicationFormValues

// Заповнити кілька полів ззовні (наприклад, даними зі сторінки вакансії)
export type FillApplicationForm = (values: Partial<ApplicationFormValues>) => void

const STATUS_OPTIONS: SelectOption<ApplicationStatus>[] = APPLICATION_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
  marker: <StatusDot status={status} />,
}))

const WORK_FORMAT_OPTIONS: SelectOption<WorkFormat>[] = WORK_FORMATS.map((format) => ({
  value: format,
  label: WORK_FORMAT_LABELS[format],
}))

type ApplicationFormProps = {
  initialValues?: ApplicationFormValues
  submitLabel: string
  pendingText: string
  // Отримує ВЖЕ перевірені й перетворені дані. Повертає помилки полів від сервера (дублікат) або нічого
  onSubmit: (input: ApplicationInput) => Promise<ApplicationFormErrors | void>
  onCancel: () => void
  extraActions?: ReactNode
  // Render prop: форма віддає функцію fill, а батько вирішує, ЩО показати над полями.
  // Так сутність не знає про фічу автозаповнення, а фіча — про внутрішню будову форми
  renderAutofill?: (fill: FillApplicationForm) => ReactNode
}

export function ApplicationForm({
  initialValues = emptyFormValues,
  submitLabel,
  pendingText,
  onSubmit,
  onCancel,
  extraActions,
  renderAutofill,
}: ApplicationFormProps) {
  const formId = useId()

  // Три типи: значення полів, контекст (не використовуємо), дані ПІСЛЯ перевірки схемою
  const form = useForm<ApplicationFormValues, unknown, ApplicationInput>({
    resolver: zodResolver(applicationFormSchema), // валідація — схемою zod
    defaultValues: initialValues,
    mode: 'onSubmit', // перша перевірка — при відправці (не "кричимо" з першої літери)
    reValidateMode: 'onChange', // після неї — на кожну зміну: помилка зникає, щойно поле виправлено
  })
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = form

  // Поле, на яке поставити фокус після відповіді сервера. Ref, а не state: це не впливає на рендер
  const fieldToFocusRef = useRef<FieldName | null>(null)

  // Під час відправки поля вимкнені (fieldset disabled), а на вимкнений елемент фокус поставити неможливо.
  // Тож фокусуємо, коли відправка завершилась і поля знову ввімкнені
  useEffect(() => {
    if (!isSubmitting && fieldToFocusRef.current) {
      setFocus(fieldToFocusRef.current)
      fieldToFocusRef.current = null
    }
  }, [isSubmitting, setFocus])

  // Викликається, лише якщо схема пропустила дані. input — уже обрізаний, з undefined замість ''
  async function submit(input: ApplicationInput) {
    try {
      const serverErrors = await onSubmit(input)
      if (!serverErrors) return

      // Помилки від сервера → у ті самі поля, що й помилки схеми
      const entries = Object.entries(serverErrors).filter(([, message]) => message)
      for (const [field, message] of entries) {
        setError(field as FieldName, { type: 'server', message })
      }
      fieldToFocusRef.current = (entries[0]?.[0] as FieldName | undefined) ?? null
    } catch (error) {
      console.error(error)
      // "root" — помилка всієї форми, не конкретного поля
      setError('root.server', {
        type: 'server',
        message: isNetworkError(error)
          ? 'Немає з’єднання з сервером. Перевір інтернет і спробуй ще раз — введені дані збережено.'
          : `Не вдалося зберегти: ${getErrorMessage(error)}`,
      })
    }
  }

  const fill: FillApplicationForm = (values) => {
    for (const name of Object.keys(values) as FieldName[]) {
      const value = values[name]
      if (value === undefined) continue
      // shouldDirty — поле "змінене" (як після введення). shouldValidate — лише якщо форму вже
      // намагались відправити: тоді помилка "Вкажи назву компанії" зникне одразу після заповнення
      setValue(name, value, { shouldDirty: true, shouldValidate: isSubmitted })
    }
  }

  function fieldId(name: FieldName) {
    return `${formId}-${name}`
  }

  function errorProps(name: FieldName) {
    const hasError = Boolean(errors[name])
    return {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? getErrorId(fieldId(name)) : undefined,
    }
  }

  return (
    // handleSubmit(submit) викликаємо в обробнику події, а не під час рендеру:
    // submit змінює ref, а ref можна чіпати лише в обробниках і ефектах
    <>
      {renderAutofill?.(fill)}
      <form onSubmit={(event) => handleSubmit(submit)(event)} className={styles.form} noValidate>
        <fieldset disabled={isSubmitting} className={styles.fieldset}>
          <FormField label="Компанія" htmlFor={fieldId('company')} error={errors.company?.message}>
            <Input
              id={fieldId('company')}
              {...register('company')}
              placeholder="Наприклад, Nebula Labs"
              autoComplete="organization"
              data-autofocus
              required
              {...errorProps('company')}
            />
          </FormField>

          <FormField label="Позиція" htmlFor={fieldId('position')} error={errors.position?.message}>
            <Input
              id={fieldId('position')}
              {...register('position')}
              placeholder="Junior React Developer"
              required
              {...errorProps('position')}
            />
          </FormField>

          <div className={styles.row}>
            <FormField label="Етап" htmlFor={fieldId('status')}>
              {/* Свій Select — не нативний <select>, тож register (читає значення з DOM-поля) не підходить.
                Controller передає значення й onChange явно — як у контрольованого поля */}
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    id={fieldId('status')}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    options={STATUS_OPTIONS}
                  />
                )}
              />
            </FormField>

            <FormField label="Формат" htmlFor={fieldId('workFormat')}>
              <Controller
                control={control}
                name="workFormat"
                render={({ field }) => (
                  <Select
                    id={fieldId('workFormat')}
                    ref={field.ref}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    options={WORK_FORMAT_OPTIONS}
                  />
                )}
              />
            </FormField>
          </div>

          <div className={styles.row}>
            <FormField label="Зарплата" htmlFor={fieldId('salary')} optional>
              <Input id={fieldId('salary')} {...register('salary')} placeholder="$1500–2000" />
            </FormField>

            <FormField
              label="Посилання"
              htmlFor={fieldId('url')}
              error={errors.url?.message}
              optional
            >
              <Input
                id={fieldId('url')}
                {...register('url')}
                type="url"
                inputMode="url"
                placeholder="https://…"
                {...errorProps('url')}
              />
            </FormField>
          </div>

          <ReminderSection form={form} fieldId={fieldId} />
        </fieldset>

        {errors.root?.server && (
          <p className={styles.formError} role="alert">
            {errors.root.server.message}
          </p>
        )}

        <div className={styles.footer}>
          {extraActions && <div className={styles.extra}>{extraActions}</div>}
          <div className={styles.actions}>
            <Button
              variant="ghost"
              aria-disabled={isSubmitting || undefined}
              onClick={() => {
                if (!isSubmitting) onCancel()
              }}
            >
              Скасувати
            </Button>
            {/* pending передаємо явно: useFormStatus бачить лише форми з action={...}, а не onSubmit */}
            <SubmitButton pendingText={pendingText} pending={isSubmitting}>
              {submitLabel}
            </SubmitButton>
          </div>
        </div>
      </form>
    </>
  )
}
