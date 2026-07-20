import { AppShell } from './components/layout/AppShell/AppShell'
import { Sidebar } from './components/layout/Sidebar/Sidebar'
import { Board } from './components/board/Board/Board'
import { BoardHeader } from './components/board/BoardHeader/BoardHeader'
import { TaskDetail } from './components/task/TaskDetail/TaskDetail'
import { ProjectModal } from './components/project/ProjectModal/ProjectModal'
import { SongManager } from './components/song/SongManager/SongManager'
import { ColumnManager } from './components/column/ColumnManager/ColumnManager'
import { useUIStore } from './stores/useUIStore'
import { Term } from './components/ui/Term/Term'
import styles from './App.module.css'

export default function App() {
  const activeProjectId = useUIStore((s) => s.activeProjectId)

  return (
    <AppShell sidebar={<Sidebar />}>
      {activeProjectId ? (
        <div className={styles.boardContainer}>
          <BoardHeader projectId={activeProjectId} />
          <Board projectId={activeProjectId} />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Term as="h2" variant="heading">Select or create a project</Term>
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
