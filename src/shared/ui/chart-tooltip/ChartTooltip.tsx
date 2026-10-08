import styles from './ChartTooltip.module.css'

type ChartTooltipProps = {
  value: string
  label: string
  details?: string[]
}

// Підказка графіка: значення — головне (воно й є відповіддю), підпис — другорядний
export function ChartTooltip({ value, label, details = [] }: ChartTooltipProps) {
  return (
    <div className={styles.tooltip}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
      {details.map((detail) => (
        <p key={detail} className={styles.detail}>
          {detail}
        </p>
      ))}
    </div>
  )
}
