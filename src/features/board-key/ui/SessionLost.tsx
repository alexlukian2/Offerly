import { KeyRound, Plus } from 'lucide-react'
import { useState } from 'react'
import { startNewBoard } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { RestoreBoardForm } from './RestoreBoardForm'
import styles from './BoardKey.module.css'

// Екран "Сесію втрачено": у цьому браузері раніше була дошка, а сесії вже немає.
// Пояснюємо, що дані не зникли, і даємо два шляхи — ключ або нова дошка
export function SessionLost() {
  const [isStarting, setIsStarting] = useState(false)

  async function handleNewBoard() {
    setIsStarting(true)
    await startNewBoard()
    window.location.assign('/app')
  }

  return (
    <div className={styles.lost}>
      <span className={styles.badge} aria-hidden="true">
        <KeyRound size={26} />
      </span>
      <h1 className={styles.lostTitle}>Сесію втрачено</h1>
      <p className={styles.text}>
        Браузер «забув», чия це дошка, — наприклад, після очищення частини даних сайту. Твої
        вакансії не видалено: вони в базі. Введи ключ дошки, щоб повернутися до них.
      </p>

      <div className={styles.lostCard}>
        <RestoreBoardForm />
      </div>

      <p className={styles.hint}>
        Немає ключа? Тоді цю дошку відновити не вийде — можна почати нову.
      </p>
      <Button variant="ghost" onClick={handleNewBoard} aria-disabled={isStarting || undefined}>
        <Plus size={16} />
        Почати нову дошку
      </Button>
    </div>
  )
}
