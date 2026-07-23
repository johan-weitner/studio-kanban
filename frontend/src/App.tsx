import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import styles from './App.module.css'
import { authClient } from './auth'
import { apiFetch } from './api/client'
import { Board } from './components/board/Board/Board'
import { BoardHeader } from './components/board/BoardHeader/BoardHeader'
import { ColumnManager } from './components/column/ColumnManager/ColumnManager'
import { AppShell } from './components/layout/AppShell/AppShell'
import { LoginPage } from './components/auth/LoginPage/LoginPage'
import { Sidebar } from './components/layout/Sidebar/Sidebar'
import { ProjectModal } from './components/project/ProjectModal/ProjectModal'
import { SongManager } from './components/song/SongManager/SongManager'
import { TaskDetail } from './components/task/TaskDetail/TaskDetail'
import { Term } from './components/ui/Term/Term'
import { useUIStore } from './stores/useUIStore'

export default function App() {
  const { data: session, isPending } = authClient.useSession()
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const setActiveProjectId = useUIStore((s) => s.setActiveProjectId)
  const qc = useQueryClient()

  // Handle ?join=<token> invite links after the session is established
  useEffect(() => {
    if (!session) return
    const params = new URLSearchParams(window.location.search)
    const token = params.get('join')
    if (!token) return
    // Remove the param from the URL without a reload
    window.history.replaceState({}, '', window.location.pathname)
    apiFetch<{ projectId: string }>(`/join/${token}`, { method: 'POST' })
      .then(({ projectId }) => {
        qc.invalidateQueries({ queryKey: ['projects'] })
        setActiveProjectId(projectId)
      })
      .catch(() => alert('This invite link is invalid or has expired.'))
  }, [session])

  if (isPending) {
    return (
      <div className={styles.loading}>
        <Term variant="muted">…</Term>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <AppShell sidebar={<Sidebar />}>
      {activeProjectId ? (
        <div className={styles.boardContainer}>
          <BoardHeader projectId={activeProjectId} />
          <Board projectId={activeProjectId} />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Term as="h2" variant="heading">
            Select or create a project
          </Term>
          <Term variant="muted">Choose a project from the sidebar to get started.</Term>
        </div>
      )}
      {/* Modals rendered at root level */}
      <TaskDetail />
      <ProjectModal />
      <SongManager />
      <ColumnManager />
    </AppShell>
  )
}
