import { useQuery } from '@tanstack/react-query'
import { NotebookPen, Plus } from 'lucide-react'
import { useState } from 'react'
import { NoteSheet, notesQueryOptions, type Note } from '@/entities/note'
import { NoteEditorModal } from '@/features/manage-note'
import { useDisclosure } from '@/shared/lib/use-disclosure'
import { Button } from '@/shared/ui/button'
import styles from './ApplicationNotes.module.css'

type ApplicationNotesProps = {
  applicationId: string
}

// Нотатки цієї вакансії — листочки у клітинку сіткою. Клік — редагувати, кнопка — новий листочок
export function ApplicationNotes({ applicationId }: ApplicationNotesProps) {
  const { data: notes = [], isPending } = useQuery(notesQueryOptions)
  const creator = useDisclosure()
  const [opened, setOpened] = useState<Note | null>(null)
  const own = notes.filter((note) => note.applicationId === applicationId)

  return (
    <section className={styles.panel} aria-labelledby="notes-title">
      <div className={styles.header}>
        <h2 id="notes-title" className={styles.title}>
          Нотатки
          {own.length > 0 && <span className={styles.count}>{own.length}</span>}
        </h2>
        <Button variant="ghost" size="sm" onClick={creator.open}>
          <Plus size={16} />
          Додати нотатку
        </Button>
      </div>

      {!isPending && own.length === 0 ? (
        <button type="button" className={styles.empty} onClick={creator.open}>
          <NotebookPen size={20} aria-hidden="true" />
          Запиши питання до співбесіди, ім’я рекрутера чи що підготувати — листочок збережеться тут
        </button>
      ) : (
        <ul className={styles.grid}>
          {own.map((note) => (
            <li key={note.id}>
              <NoteSheet note={note} onOpen={() => setOpened(note)} />
            </li>
          ))}
        </ul>
      )}

      {creator.isOpen && <NoteEditorModal applicationId={applicationId} onClose={creator.close} />}
      {opened && <NoteEditorModal note={opened} onClose={() => setOpened(null)} />}
    </section>
  )
}
