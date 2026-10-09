import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createNote,
  deleteNote,
  noteKeys,
  updateNote,
  type CreateNoteInput,
  type Note,
  type UpdateNoteInput,
} from '@/entities/note'
import { isNetworkError } from '@/shared/lib/errors'
import { useToast } from '@/shared/ui/toast'

// Створення, зміна й видалення нотаток. Після кожної дії самі оновлюємо кеш списку:
// ми точно знаємо результат, тож перезапитувати всі нотатки не треба
export function useNoteMutations() {
  const queryClient = useQueryClient()
  const showToast = useToast()

  const setNotes = (update: (notes: Note[]) => Note[]) =>
    queryClient.setQueryData<Note[]>(noteKeys.all, (current) => update(current ?? []))

  const onError = (error: Error) =>
    showToast({
      variant: 'error',
      message: isNetworkError(error) ? 'Немає з’єднання — нотатку не збережено' : 'Не вдалося зберегти нотатку',
    })

  const create = useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: (note) => setNotes((notes) => [note, ...notes]),
    onError,
  })

  const update = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateNoteInput }) => updateNote(id, changes),
    // Оптимістично: переміщення нотатки між колонками має відбуватись миттєво, як і з картками
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all })
      const previous = queryClient.getQueryData<Note[]>(noteKeys.all)
      setNotes((notes) => notes.map((note) => (note.id === id ? { ...note, ...changes } : note)))
      return { previous }
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(noteKeys.all, context.previous)
      onError(error)
    },
    onSuccess: (saved) => setNotes((notes) => notes.map((note) => (note.id === saved.id ? saved : note))),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: (_, id) => {
      setNotes((notes) => notes.filter((note) => note.id !== id))
      showToast({ message: 'Нотатку видалено' })
    },
    onError,
  })

  return { create, update, remove }
}
