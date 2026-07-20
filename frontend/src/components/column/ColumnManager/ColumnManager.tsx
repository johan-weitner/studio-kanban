import { useState } from 'react'
import styles from './ColumnManager.module.css'
import { Modal } from '../../ui/Modal/Modal'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import { useUIStore } from '../../../stores/useUIStore'
import {
  useColumns,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
} from '../../../hooks/useColumns'

export function ColumnManager() {
  const isColumnManagerOpen = useUIStore((s) => s.isColumnManagerOpen)
  const closeColumnManager = useUIStore((s) => s.closeColumnManager)
  const activeProjectId = useUIStore((s) => s.activeProjectId)

  const { data: columns } = useColumns(activeProjectId ?? '')
  const createColumn = useCreateColumn()
  const updateColumn = useUpdateColumn()
  const deleteColumn = useDeleteColumn()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#8b5cf6')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  if (!activeProjectId) return null

  const handleAdd = () => {
    if (newName.trim()) {
      createColumn.mutate({
        projectId: activeProjectId,
        name: newName.trim(),
        color: newColor,
      })
      setNewName('')
      setNewColor('#8b5cf6')
    }
  }

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateColumn.mutate({ id, projectId: activeProjectId, name: editName.trim() })
    }
    setEditingId(null)
  }

  const handleColorChange = (id: string, color: string) => {
    updateColumn.mutate({ id, projectId: activeProjectId, color })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this column? All tasks in it will also be deleted.')) {
      deleteColumn.mutate({ id, projectId: activeProjectId })
    }
  }

  return (
    <Modal
      open={isColumnManagerOpen}
      onOpenChange={(open) => { if (!open) closeColumnManager() }}
      title="Manage Columns"
    >
      <div className={styles.list}>
        {columns?.map((col) => (
          <div key={col.id} className={styles.row}>
            <input
              type="color"
              className={styles.colorInput}
              value={col.color}
              onChange={(e) => handleColorChange(col.id, e.target.value)}
              title="Column color"
            />
            {editingId === col.id ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onBlur={() => handleSaveEdit(col.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(col.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
              />
            ) : (
              <button
                className={styles.colName}
                onClick={() => handleStartEdit(col.id, col.name)}
              >
                <Term>{col.name}</Term>
              </button>
            )}
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(col.id)}
              aria-label="Delete column"
            >
              ×
            </button>
          </div>
        ))}
        {(!columns || columns.length === 0) && (
          <div className={styles.empty}>
            <Term variant="muted">No columns. Add one below.</Term>
          </div>
        )}
      </div>
      <div className={styles.addRow}>
        <input
          type="color"
          className={styles.colorInput}
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
        />
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Column name…"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
        />
        <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newName.trim()}>
          <Term>Add</Term>
        </Button>
      </div>
    </Modal>
  )
}
