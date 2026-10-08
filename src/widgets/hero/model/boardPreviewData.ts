export type PreviewCard = {
  id: string
  company: string
  role: string
  location: string
  salary?: string
}

export type PreviewColumn = {
  id: string
  title: string
  color: string
  cards: PreviewCard[]
}

export const previewColumns: PreviewColumn[] = [
  {
    id: 'applied',
    title: 'Відгукнувся',
    color: 'var(--color-status-applied)',
    cards: [
      { id: 'c1', company: 'Nebula Labs', role: 'Junior React Developer', location: 'Remote', salary: '$1200–1600' },
      { id: 'c2', company: 'Pixelforge', role: 'Frontend Developer', location: 'Київ', salary: '$1500–2000' },
      { id: 'c3', company: 'Datawise', role: 'React Engineer', location: 'Remote' },
    ],
  },
  {
    id: 'test',
    title: 'Тестове',
    color: 'var(--color-status-test)',
    cards: [
      { id: 'c4', company: 'Krona Pay', role: 'Frontend Developer', location: 'Львів', salary: '$1800' },
    ],
  },
  {
    id: 'interview',
    title: "Інтерв'ю",
    color: 'var(--color-status-interview)',
    cards: [
      { id: 'c5', company: 'Brightloop', role: 'Junior Frontend', location: 'Remote', salary: '$1400' },
      { id: 'c6', company: 'Hexa Studio', role: 'React Developer', location: 'Hybrid' },
    ],
  },
  {
    id: 'offer',
    title: 'Офер',
    color: 'var(--color-status-offer)',
    cards: [
      { id: 'c7', company: 'Orbita', role: 'Frontend Developer', location: 'Remote', salary: '$2000' },
    ],
  },
]
