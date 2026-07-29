import type { Column, Song, Task } from '../../../api/types'
import { Term } from '../../ui/Term/Term'
import { SwimlaneCell } from '../SwimlaneCell/SwimlaneCell'
import { useUIStore } from '../../../stores/useUIStore'
import styles from './Swimlane.module.css'

interface SwimlaneProps {
  song: Song
  columns: Column[]
  tasks: Task[]
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Swimlane({ song, columns, tasks, collapsed, onToggleCollapse }: SwimlaneProps) {
  const openCommentDrawer = useUIStore((s) => s.openCommentDrawer)
  const commentTarget = useUIStore((s) => s.commentTarget)
  const isCommentOpen = commentTarget?.type === 'song' && commentTarget.id === song.id
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
        <button
          className={[styles.commentBtn, isCommentOpen ? styles.commentBtnActive : ''].filter(Boolean).join(' ')}
          onClick={() => openCommentDrawer({ type: 'song', id: song.id, title: song.title })}
          aria-label="Comments"
          title="Comments"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
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
