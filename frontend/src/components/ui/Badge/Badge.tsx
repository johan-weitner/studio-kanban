import styles from './Badge.module.css'

type BadgeStatus = 'pending' | 'in-progress' | 'done' | 'discarded'

interface BadgeProps {
  label: string
  color?: string | BadgeStatus
  className?: string
}

const STATUS_COLORS: Record<BadgeStatus, string> = {
  'pending': 'var(--color-pending)',
  'in-progress': 'var(--color-in-progress)',
  'done': 'var(--color-done)',
  'discarded': 'var(--color-discarded)',
}

export function Badge({ label, color, className }: BadgeProps) {
  const isStatus = color && color in STATUS_COLORS
  const bg = isStatus
    ? STATUS_COLORS[color as BadgeStatus]
    : (color ?? 'var(--bg-card-hover)')

  return (
    <span
      className={[styles.badge, className].filter(Boolean).join(' ')}
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  )
}
