import styles from './App.module.css'
import { authClient } from './auth'
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
