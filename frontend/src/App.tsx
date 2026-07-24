import styles from './App.module.css'
import { Board } from './components/board/Board/Board'
import { BoardHeader } from './components/board/BoardHeader/BoardHeader'
import { SequencingView } from './components/sequencing/SequencingView/SequencingView'
import { ColumnManager } from './components/column/ColumnManager/ColumnManager'
import { AppShell } from './components/layout/AppShell/AppShell'
import { Sidebar } from './components/layout/Sidebar/Sidebar'
import { ProjectModal } from './components/project/ProjectModal/ProjectModal'
import { SongManager } from './components/song/SongManager/SongManager'
import { TaskDetail } from './components/task/TaskDetail/TaskDetail'
import { Term } from './components/ui/Term/Term'
import { useUIStore } from './stores/useUIStore'

export default function App() {
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const activeView = useUIStore((s) => s.activeView)

  return (
    <AppShell sidebar={<Sidebar />}>
      {activeProjectId ? (
        <div className={styles.boardContainer}>
          <BoardHeader projectId={activeProjectId} />
          {/* Both views stay mounted so the SoundCloud iframe is never destroyed.
              CSS visibility toggling keeps the inactive view out of sight. */}
          <div style={{ display: activeView === 'board' ? 'contents' : 'none' }}>
            <Board projectId={activeProjectId} />
          </div>
          <div style={{ display: activeView === 'sequence' ? 'contents' : 'none' }}>
            <SequencingView projectId={activeProjectId} />
          </div>
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
