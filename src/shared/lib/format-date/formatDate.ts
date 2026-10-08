const shortDateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatShortDate(date: string | Date) {
  return shortDateFormatter.format(new Date(date))
}

export function formatLongDate(isoDate: string) {
  return longDateFormatter.format(new Date(isoDate))
}
