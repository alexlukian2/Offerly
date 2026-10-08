const percentFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'percent',
  maximumFractionDigits: 0,
})

// 0.4567 → "46 %"
export function formatPercent(ratio: number) {
  return percentFormatter.format(ratio)
}
