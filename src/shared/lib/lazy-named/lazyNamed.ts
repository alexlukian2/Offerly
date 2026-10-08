import { lazy, type ComponentType } from 'react'

// React.lazy вміє працювати лише з default-експортом модуля.
// У нас усі компоненти — іменовані експорти, тож перетворюємо: { BoardPage } → { default: BoardPage }
export function lazyNamed<Name extends string, Module extends Record<Name, ComponentType>>(
  load: () => Promise<Module>,
  name: Name,
) {
  return lazy(async () => {
    const module = await load()
    return { default: module[name] }
  })
}
