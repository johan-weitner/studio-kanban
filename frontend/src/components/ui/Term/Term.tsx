import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Term.module.css'

type TermTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'small'
type TermVariant = 'body' | 'heading' | 'caption' | 'muted' | 'label'

interface TermProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  as?: TermTag
  variant?: TermVariant
}

export function Term({ children, as: Tag = 'span', variant = 'body', className, ...rest }: TermProps) {
  return (
    <Tag className={[styles[variant], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  )
}
