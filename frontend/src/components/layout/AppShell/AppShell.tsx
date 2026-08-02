import type { ReactNode } from 'react'
import { useUIStore } from '../../../stores/useUIStore'
import styles from './AppShell.module.css'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
}

export function AppShell({ sidebar, children }: AppShellProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)
  return (
    <div className={styles.shell}>
      <aside className={[styles.sidebar, collapsed ? styles.sidebarCollapsed : ''].filter(Boolean).join(' ')}>
        {sidebar}
      </aside>
      <div className={styles.mainWrapper}>
        {/* Expand tab — only visible when sidebar is collapsed */}
        {collapsed && (
          <button className={styles.expandTab} onClick={toggle} aria-label="Expand sidebar" title="Expand sidebar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
