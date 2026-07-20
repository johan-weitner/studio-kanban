import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
