import type { ReactNode } from 'react'
import styles from './Term.module.css'

type TermTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'small'
type TermVariant = 'body' | 'heading' | 'caption' | 'muted' | 'label'

interface TermProps {
  children: ReactNode
  as?: TermTag
  variant?: TermVariant
  className?: string
}

export function Term({ children, as: Tag = 'span', variant = 'body', className }: TermProps) {
  return (
    <Tag className={[styles[variant], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
