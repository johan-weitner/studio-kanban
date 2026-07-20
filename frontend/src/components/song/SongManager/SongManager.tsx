import { useState } from 'react'
import styles from './SongManager.module.css'
import { Modal } from '../../ui/Modal/Modal'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import { useUIStore } from '../../../stores/useUIStore'
import { useSongs, useCreateSong, useUpdateSong, useDeleteSong } from '../../../hooks/useSongs'

export function SongManager() {
  const isSongManagerOpen = useUIStore((s) => s.isSongManagerOpen)
  const closeSongManager = useUIStore((s) => s.closeSongManager)
  const activeProjectId = useUIStore((s) => s.activeProjectId)

  const { data: songs } = useSongs(activeProjectId ?? '')
  const createSong = useCreateSong()
  const updateSong = useUpdateSong()
  const deleteSong = useDeleteSong()

  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  if (!activeProjectId) return null

  const handleAdd = () => {
    if (newTitle.trim()) {
      createSong.mutate({ projectId: activeProjectId, title: newTitle.trim() })
      setNewTitle('')
    }
  }

  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditTitle(title)
  }

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateSong.mutate({ id, projectId: activeProjectId, title: editTitle.trim() })
    }
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this song and all its tasks?')) {
      deleteSong.mutate({ id, projectId: activeProjectId })
    }
  }

  return (
    <Modal
      open={isSongManagerOpen}
      onOpenChange={(open) => { if (!open) closeSongManager() }}
      title="Manage Songs"
    >
      <div className={styles.list}>
        {songs?.map((song) => (
          <div key={song.id} className={styles.row}>
            {editingId === song.id ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                onBlur={() => handleSaveEdit(song.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(song.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
              />
            ) : (
              <button
                className={styles.songTitle}
                onClick={() => handleStartEdit(song.id, song.title)}
              >
                <Term>{song.title}</Term>
              </button>
            )}
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(song.id)}
              aria-label="Delete song"
            >
              ×
            </button>
          </div>
        ))}
        {(!songs || songs.length === 0) && (
          <div className={styles.empty}>
            <Term variant="muted">No songs yet. Add one below.</Term>
          </div>
        )}
      </div>
      <div className={styles.addRow}>
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Song title…"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
        />
        <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newTitle.trim()}>
          <Term>Add</Term>
        </Button>
      </div>
    </Modal>
  )
}
