import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NetworkError } from '@/shared/lib/errors'
import { ApplicationForm } from './ApplicationForm'

// Рендеримо форму з заглушками замість справжніх дій.
// onSubmit — vi.fn: можна перевірити, з чим його викликали, і задати, що він поверне
function setup(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const user = userEvent.setup()
  render(
    <ApplicationForm
      submitLabel="Додати"
      pendingText="Додаємо…"
      onSubmit={onSubmit}
      onCancel={vi.fn()}
    />,
  )
  return { user, onSubmit }
}

describe('ApplicationForm', () => {
  it('показує помилки порожніх полів і не викликає onSubmit', async () => {
    const { user, onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Додати' }))

    // Шукаємо так, як бачить користувач / скрінрідер: за підписом поля і текстом
    expect(await screen.findByText('Вкажи назву компанії')).toBeInTheDocument()
    expect(screen.getByLabelText('Компанія')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Компанія')).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('ховає помилку поля, щойно користувач почав його виправляти', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Додати' }))
    expect(await screen.findByText('Вкажи назву компанії')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Компанія'), 'N')

    expect(screen.queryByText('Вкажи назву компанії')).not.toBeInTheDocument()
    expect(screen.getByText('Вкажи позицію')).toBeInTheDocument() // інша помилка лишилась
  })

  it('передає введені значення в onSubmit', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Компанія'), 'Nebula Labs')
    await user.type(screen.getByLabelText('Позиція'), 'Frontend Developer')
    // Свій Select — це кнопка з роллю combobox, а не <select>: відкриваємо й клікаємо пункт
    await user.click(screen.getByRole('combobox', { name: 'Етап' }))
    await user.click(screen.getByRole('option', { name: 'Інтерв’ю' }))
    await user.click(screen.getByRole('button', { name: 'Додати' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          company: 'Nebula Labs',
          position: 'Frontend Developer',
          status: 'interview',
        }),
      ),
    )
  })

  it('показує помилку від "сервера" біля поля і зберігає введене', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ position: 'Ця позиція вже є' })
    const { user } = setup(onSubmit)

    await user.type(screen.getByLabelText('Компанія'), 'Nebula Labs')
    await user.type(screen.getByLabelText('Позиція'), 'Dev')
    await user.click(screen.getByRole('button', { name: 'Додати' }))

    expect(await screen.findByText('Ця позиція вже є')).toBeInTheDocument()
    expect(screen.getByLabelText('Компанія')).toHaveValue('Nebula Labs')
    // Фокус — на поле з помилкою від сервера (баг уроку 23: поля були вимкнені під час відправки)
    await waitFor(() => expect(screen.getByLabelText('Позиція')).toHaveFocus())
  })

  it('при мережевій помилці показує банер з role="alert"', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new NetworkError())
    vi.spyOn(console, 'error').mockImplementation(() => {}) // форма пише помилку в консоль — глушимо
    const { user } = setup(onSubmit)

    await user.type(screen.getByLabelText('Компанія'), 'Nebula Labs')
    await user.type(screen.getByLabelText('Позиція'), 'Dev')
    await user.click(screen.getByRole('button', { name: 'Додати' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Немає з’єднання з сервером')
  })
})
