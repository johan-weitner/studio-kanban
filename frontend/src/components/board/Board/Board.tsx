import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensors, useSensor } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { useColumns } from '../../../hooks/useColumns'
import { useSongs } from '../../../hooks/useSongs'
import { useTasks, useMoveTask } from '../../../hooks/useTasks'
import { useSequence } from '../../../hooks/useSequence'
import { usePlayerStore } from '../../../stores/usePlayerStore'
import { useUIStore } from '../../../stores/useUIStore'
import { Swimlane } from '../Swimlane/Swimlane'
import { BoardMiniPlayer } from '../BoardMiniPlayer/BoardMiniPlayer'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import type { Column, Song, Task } from '../../../api/types'
import type { SequenceTrack } from '../../../hooks/useSequence'
import styles from './Board.module.css'

interface BoardProps {
  projectId: string
}

interface SongRowWithDataProps {
  song: Song
  columns: Column[]
  collapsed: boolean
  onToggleCollapse: () => void
  sequenceTracks: SequenceTrack[]
  activeScTrackId: string | null
}

function SongRowWithData({ song, columns, collapsed, onToggleCollapse, sequenceTracks, activeScTrackId }: SongRowWithDataProps) {
  const { data: tasks } = useTasks(song.id)
  return (
    <Swimlane
      song={song}
      columns={columns}
      tasks={tasks ?? []}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      sequenceTracks={sequenceTracks}
      activeScTrackId={activeScTrackId}
    />
  )
}

/** Normalise a title for fuzzy matching between songs and sequence tracks */
function normalise(s: string) {
  return s.toLowerCase().trim()
}

export function findTrackForSong(song: Song, tracks: SequenceTrack[]): string | null {
  const songNorm = normalise(song.title)
  const match =
    tracks.find((t) => normalise(t.title) === songNorm) ??
    tracks.find((t) => normalise(t.title).includes(songNorm)) ??
    tracks.find((t) => songNorm.includes(normalise(t.title)))
  return match?.scTrackId ?? null
}

export function Board({ projectId }: BoardProps) {
  const { data: columns, isLoading: colLoading } = useColumns(projectId)
  const { data: songs, isLoading: songLoading } = useSongs(projectId)
  const { data: sequenceData } = useSequence(projectId)
  const moveTask = useMoveTask()
  const [collapsedSongs, setCollapsedSongs] = useState<Set<string>>(new Set())

  const activeView = useUIStore((s) => s.activeView)
  const activeScTrackId = usePlayerStore((s) => s.activeScTrackId)
  const playerControls = usePlayerStore((s) => s.playerControls)
  const setRepeatEnabled = usePlayerStore((s) => s.setRepeatEnabled)

  const approvedTracks = sequenceData?.approved ?? []
  // Include unapproved so a playing unapproved track still focuses its swimlane
  const allSequenceTracks = [...approvedTracks, ...(sequenceData?.unapproved ?? [])]

  // Auto-expand the song matching the currently-playing track when switching to board view;
  // also enable repeat so the track loops while the user works in the board.
  useEffect(() => {
    if (activeView !== 'board' || !activeScTrackId || !songs?.length) return
    const activeTrack = allSequenceTracks.find((t) => t.scTrackId === activeScTrackId)
    if (!activeTrack) return
    const matchingSong = songs.find(
      (s) => normalise(s.title) === normalise(activeTrack.title) ||
             normalise(activeTrack.title).includes(normalise(s.title)) ||
             normalise(s.title).includes(normalise(activeTrack.title))
    )
    if (!matchingSong) return
    setCollapsedSongs(new Set(songs.filter((s) => s.id !== matchingSong.id).map((s) => s.id)))
    // Enable repeat for the focused song; user can turn it off with the repeat button.
    setRepeatEnabled(true)
  }, [activeView, activeScTrackId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Arrow-key seek — only while in board view and playback controls are available
  useEffect(() => {
    if (activeView !== 'board') return
    const handleKey = (e: KeyboardEvent) => {
      if (!playerControls) return
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) return
      if (e.key === 'ArrowLeft') {
        playerControls.getPosition((pos) => playerControls.seekTo(Math.max(0, pos - 15000)))
      } else if (e.key === 'ArrowRight') {
        playerControls.getPosition((pos) => playerControls.seekTo(pos + 15000))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeView, playerControls])

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

  const allCollapsed = !!songs?.length && songs.every((s) => collapsedSongs.has(s.id))

  const toggleAllSongs = () => {
    if (allCollapsed) {
      setCollapsedSongs(new Set())
    } else {
      setCollapsedSongs(new Set(songs?.map((s) => s.id) ?? []))
    }
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
      const parts = overId.split(':')
      toSongId = parts[0]
      toColumnId = parts[1]
    } else {
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

  const gridTemplateColumns = `repeat(${columns.length}, minmax(180px, 1fr))`

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {songs && songs.length > 0 && (
        <div className={styles.toolbar}>
          <BoardMiniPlayer projectId={projectId} />
          <Button variant="ghost" size="sm" onClick={toggleAllSongs}>
            <Term>{allCollapsed ? 'Expand all' : 'Collapse all'}</Term>
          </Button>
        </div>
      )}
      <div className={styles.boardWrapper}>
        <div className={styles.board} style={{ gridTemplateColumns }}>
          {columns.map((col) => (
            <div key={col.id} className={styles.colHeader}>
              <span className={styles.colDot} style={{ background: col.color }} />
              <Term variant="label">{col.name}</Term>
            </div>
          ))}

          {songs?.map((song) => (
            <SongRowWithData
              key={song.id}
              song={song}
              columns={columns}
              collapsed={collapsedSongs.has(song.id)}
              onToggleCollapse={() => toggleSong(song.id)}
          sequenceTracks={allSequenceTracks}
              activeScTrackId={activeScTrackId}
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
        {/* DragOverlay content handled by sortable context */}
      </DragOverlay>
    </DndContext>
  )
}
