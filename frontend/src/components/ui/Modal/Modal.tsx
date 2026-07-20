import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import styles from './Modal.module.css'
import { Term } from '../Term/Term'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title asChild>
            <Term as="h2" variant="heading" className={styles.title}>
              {title}
            </Term>
          </Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
