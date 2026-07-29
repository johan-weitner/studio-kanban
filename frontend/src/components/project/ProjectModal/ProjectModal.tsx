import { useState, useEffect } from 'react'
import styles from './ProjectModal.module.css'
import { Modal } from '../../ui/Modal/Modal'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import { Textarea } from '../../ui/Textarea/Textarea'
import { useUIStore } from '../../../stores/useUIStore'
import {
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProject,
} from '../../../hooks/useProjects'
import { apiFetch } from '../../../api/client'
import type { SequenceTrack } from '../../../hooks/useSequence'

export function ProjectModal() {
  const isCreateOpen = useUIStore((s) => s.isCreateProjectOpen)
  const closeCreate = useUIStore((s) => s.closeCreateProject)
  const editProjectId = useUIStore((s) => s.editProjectId)
  const closeEdit = useUIStore((s) => s.closeEditProject)
  const setActiveProjectId = useUIStore((s) => s.setActiveProjectId)
  const activeProjectId = useUIStore((s) => s.activeProjectId)

  const { data: editProject } = useProject(editProjectId)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const isEditMode = !!editProjectId
  const isOpen = isCreateOpen || isEditMode
  const title = isEditMode ? 'Edit Project' : 'New Project'

  useEffect(() => {
    if (editProject) {
      setName(editProject.name)
      setDescription(editProject.description ?? '')
    } else if (isCreateOpen) {
      setName('')
      setDescription('')
      setPlaylistUrl('')
    }
  }, [editProject, isCreateOpen])

  const handleClose = () => {
    if (isEditMode) closeEdit()
    else closeCreate()
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (isEditMode && editProjectId) {
      updateProject.mutate({
        id: editProjectId,
        name: name.trim(),
        description: description.trim() || undefined,
      })
      closeEdit()
      return
    }

    setIsCreating(true)
    try {
      // 1. Create the project
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      })

      // 2. Optionally connect + sync the SoundCloud playlist
      if (playlistUrl.trim()) {
        // Save the URL (auto-extracts secret token from share links)
        await apiFetch(`/projects/${project.id}/soundcloud`, {
          method: 'PATCH',
          body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
        })

        // Sync tracks from the SC playlist
        const syncResult = await apiFetch<{ synced: number; tracks: SequenceTrack[] }>(
          `/projects/${project.id}/soundcloud/sync`,
          { method: 'POST' }
        )

        // Pre-populate the board with one song per SC track
        for (let i = 0; i < syncResult.tracks.length; i++) {
          await apiFetch(`/projects/${project.id}/songs`, {
            method: 'POST',
            body: JSON.stringify({ title: syncResult.tracks[i].title, order: i }),
          })
        }
      }

      setActiveProjectId(project.id)
      closeCreate()
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!editProjectId) return
    if (window.confirm('Delete this project and all its data?')) {
      deleteProject.mutate(editProjectId)
      if (activeProjectId === editProjectId) {
        setActiveProjectId(null)
      }
      closeEdit()
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }} title={title}>
      <div className={styles.form}>
        <div className={styles.field}>
          <Term as="label" variant="label">Project Name</Term>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Album"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          />
        </div>
        <div className={styles.field}>
          <Term as="label" variant="label">Description (optional)</Term>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
          />
        </div>
        {!isEditMode && (
          <div className={styles.field}>
            <Term as="label" variant="label">SoundCloud playlist (optional)</Term>
            <Input
              type="url"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="https://soundcloud.com/you/sets/my-album"
            />
            <Term variant="muted" className={styles.hint}>
              Paste a public URL or full share link. Tracks will be added as songs on the board and connected to the Sequencing view.
            </Term>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        {isEditMode && (
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Term>Delete</Term>
          </Button>
        )}
        <div className={styles.footerRight}>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <Term>Cancel</Term>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim() || isCreating}
          >
            <Term>
              {isCreating
                ? (playlistUrl.trim() ? 'Creating…' : 'Creating…')
                : (isEditMode ? 'Save' : 'Create')}
            </Term>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
