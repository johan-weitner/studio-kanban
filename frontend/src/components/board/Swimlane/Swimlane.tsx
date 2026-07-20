import type { Column, Song, Task } from '../../../api/types'
import { Term } from '../../ui/Term/Term'
import { SwimlaneCell } from '../SwimlaneCell/SwimlaneCell'
import styles from './Swimlane.module.css'

interface SwimlaneProps {
  song: Song
  columns: Column[]
  tasks: Task[]
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Swimlane({ song, columns, tasks, collapsed, onToggleCollapse }: SwimlaneProps) {
  return (
    <>
      {/* Swimlane header — spans all columns */}
      <div className={styles.header} style={{ gridColumn: '1 / -1' }}>
        <button
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand swimlane' : 'Collapse swimlane'}
        >
          <span className={[styles.arrow, collapsed ? styles.arrowCollapsed : ''].filter(Boolean).join(' ')}>
            ▾
          </span>
        </button>
        <div className={styles.titleGroup}>
          <Term className={styles.songTitle}>{song.title}</Term>
          {song.description && (
            <Term variant="muted" className={styles.songDesc}>{song.description}</Term>
          )}
        </div>
        <span className={styles.taskCount}>
          <Term variant="muted">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</Term>
        </span>
      </div>

      {/* Task cells per column — hidden when collapsed */}
      {!collapsed && columns.map((col) => (
        <SwimlaneCell
          key={col.id}
          songId={song.id}
          columnId={col.id}
          tasks={tasks.filter((t) => t.columnId === col.id)}
        />
      ))}
    </>
  )
}
