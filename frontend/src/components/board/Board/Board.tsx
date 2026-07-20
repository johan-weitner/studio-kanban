import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensors, useSensor } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { useColumns } from '../../../hooks/useColumns'
import { useSongs } from '../../../hooks/useSongs'
import { useTasks, useMoveTask } from '../../../hooks/useTasks'
import { Swimlane } from '../Swimlane/Swimlane'
import { Term } from '../../ui/Term/Term'
import type { Column, Song, Task } from '../../../api/types'
import styles from './Board.module.css'

interface BoardProps {
  projectId: string
}

interface SongRowWithDataProps {
  song: Song
  columns: Column[]
  collapsed: boolean
  onToggleCollapse: () => void
}

function SongRowWithData({ song, columns, collapsed, onToggleCollapse }: SongRowWithDataProps) {
  const { data: tasks } = useTasks(song.id)
  return (
    <Swimlane
      song={song}
      columns={columns}
      tasks={tasks ?? []}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
    />
  )
}

export function Board({ projectId }: BoardProps) {
  const { data: columns, isLoading: colLoading } = useColumns(projectId)
  const { data: songs, isLoading: songLoading } = useSongs(projectId)
  const moveTask = useMoveTask()
  const [collapsedSongs, setCollapsedSongs] = useState<Set<string>>(new Set())

  // Require 8px of movement before a drag activates, so plain clicks
  // are never mistaken for drags and always open the task detail modal.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const toggleSong = (id: string) => {
    setCollapsedSongs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const task = active.data.current?.task as Task | undefined
    if (!task) return

    let toSongId: string
    let toColumnId: string

    const overId = String(over.id)
    if (overId.includes(':')) {
      // Dropped on a cell droppable — id format: `${songId}:${columnId}`
      const parts = overId.split(':')
      toSongId = parts[0]
      toColumnId = parts[1]
    } else {
      // Dropped on another task's sortable — get cell info from its data
      const overTask = over.data.current?.task as Task | undefined
      if (!overTask) return
      toSongId = overTask.songId
      toColumnId = overTask.columnId
    }

    if (!toSongId || !toColumnId) return

    const fromSongId = task.songId
    if (toSongId === fromSongId && toColumnId === task.columnId) return

    moveTask.mutate({
      id: task.id,
      columnId: toColumnId,
      songId: toSongId !== fromSongId ? toSongId : undefined,
      fromSongId,
    })
  }

  if (colLoading || songLoading) {
    return (
      <div className={styles.loading}>
        <Term variant="muted">Loading board…</Term>
      </div>
    )
  }

  if (!columns || columns.length === 0) {
    return (
      <div className={styles.empty}>
        <Term variant="muted">No columns yet. Click "Manage Columns" to add some.</Term>
      </div>
    )
  }

  const gridTemplateColumns = `repeat(${columns.length}, minmax(200px, 1fr))`

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className={styles.boardWrapper}>
        <div className={styles.board} style={{ gridTemplateColumns }}>
          {/* Column headers row */}
          {columns.map((col) => (
            <div key={col.id} className={styles.colHeader}>
              <span className={styles.colDot} style={{ background: col.color }} />
              <Term variant="label">{col.name}</Term>
            </div>
          ))}

          {/* Swimlane rows */}
          {songs?.map((song) => (
            <SongRowWithData
              key={song.id}
              song={song}
              columns={columns}
              collapsed={collapsedSongs.has(song.id)}
              onToggleCollapse={() => toggleSong(song.id)}
            />
          ))}

          {(!songs || songs.length === 0) && (
            <div className={styles.emptyRow} style={{ gridColumn: `1 / -1` }}>
              <Term variant="muted">No songs yet. Click "Manage Songs" to add some.</Term>
            </div>
          )}
        </div>
      </div>
      <DragOverlay>
        {/* DragOverlay content is handled by the sortable context */}
      </DragOverlay>
    </DndContext>
  )
}
