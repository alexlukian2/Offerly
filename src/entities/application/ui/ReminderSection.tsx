import { BellPlus, BellRing, X } from 'lucide-react'
import { useState } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/shared/lib/browser-notifications'
import { cn } from '@/shared/lib/cn'
import { FormField, getErrorId, Input } from '@/shared/ui/form'
import type { ApplicationInput } from '../api/applicationRow'
import type { ApplicationFormValues } from '../model/applicationForm'
import { getReminderPresets, toLocalInputValue } from '../model/reminder'
import styles from './ReminderSection.module.css'

type ReminderSectionProps = {
  form: UseFormReturn<ApplicationFormValues, unknown, ApplicationInput>
  fieldId: (name: 'remindAt' | 'remindNote') => string
}

// Нагадування — НЕобов'язкове: за замовчуванням згорнуте в одну кнопку.
// Розгорнуте — швидкі варіанти, точний час і коротка нотатка
export function ReminderSection({ form, fieldId }: ReminderSectionProps) {
  const { register, setValue, control, formState } = form
  const remindAt = useWatch({ control, name: 'remindAt' })
  // Розгорнуто одразу, якщо нагадування вже стоїть (редагування)
  const [isOpen, setIsOpen] = useState(remindAt !== '')
  const [permission, setPermission] = useState(getNotificationPermission)
  const presets = getReminderPresets()

  const setOptions = { shouldDirty: true, shouldValidate: formState.isSubmitted }

  function close() {
    // Згорнути = прибрати нагадування: порожні поля → схема перетворить на "немає"
    setValue('remindAt', '', setOptions)
    setValue('remindNote', '', setOptions)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button type="button" className={styles.add} onClick={() => setIsOpen(true)}>
        <BellPlus size={16} aria-hidden="true" />
        Додати нагадування
        <span className={styles.hint}>необов’язково</span>
      </button>
    )
  }

  const error = formState.errors.remindAt?.message

  return (
    <fieldset className={styles.section}>
      <legend className={styles.legend}>
        <BellRing size={16} aria-hidden="true" />
        Нагадування
      </legend>
      <button type="button" className={styles.remove} onClick={close} aria-label="Прибрати нагадування">
        <X size={16} />
      </button>

      <div className={styles.presets} role="group" aria-label="Швидкий вибір часу">
        {presets.map(({ label, date }) => {
          const value = toLocalInputValue(date.toISOString())
          return (
            <button
              key={label}
              type="button"
              className={cn(styles.preset, remindAt === value && styles.presetActive)}
              aria-pressed={remindAt === value}
              onClick={() => setValue('remindAt', value, setOptions)}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className={styles.row}>
        <FormField label="Коли" htmlFor={fieldId('remindAt')} error={error}>
          <Input
            id={fieldId('remindAt')}
            type="datetime-local"
            {...register('remindAt')}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? getErrorId(fieldId('remindAt')) : undefined}
          />
        </FormField>
        <FormField
          label="Нотатка"
          htmlFor={fieldId('remindNote')}
          error={formState.errors.remindNote?.message}
          optional
        >
          <Input
            id={fieldId('remindNote')}
            {...register('remindNote')}
            placeholder="Написати рекрутеру"
            maxLength={200}
          />
        </FormField>
      </div>

      {/* Пропонуємо, а не вимагаємо: без дозволу нагадування однаково з'явиться на сайті */}
      {permission === 'default' && (
        <button
          type="button"
          className={styles.permission}
          onClick={async () => setPermission(await requestNotificationPermission())}
        >
          Показувати ще й системне сповіщення, коли вкладка у фоні
        </button>
      )}
      {permission === 'granted' && (
        <p className={styles.note}>Нагадаємо на сайті й системним сповіщенням браузера.</p>
      )}
      {(permission === 'denied' || permission === 'unsupported') && (
        <p className={styles.note}>Нагадування з’явиться, коли сайт відкритий.</p>
      )}
    </fieldset>
  )
}
