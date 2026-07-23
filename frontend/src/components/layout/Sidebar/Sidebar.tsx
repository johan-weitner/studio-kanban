import { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import styles from './Sidebar.module.css'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import { useProjects } from '../../../hooks/useProjects'
import { useUIStore } from '../../../stores/useUIStore'
import { authClient } from '../../../auth'
import { apiFetch } from '../../../api/client'

export function Sidebar() {
  const { data: projects, isLoading } = useProjects()
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const setActiveProjectId = useUIStore((s) => s.setActiveProjectId)
  const openCreateProject = useUIStore((s) => s.openCreateProject)
  const openEditProject = useUIStore((s) => s.openEditProject)
  const { data: session } = authClient.useSession()
  const importRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const handleExport = async () => {
    const data = await apiFetch<object>('/export')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studio-kanban-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const result = await apiFetch<{ importedProjects: number; importedSongs: number; importedTasks: number }>(
        '/import',
        { method: 'POST', body: JSON.stringify(json) }
      )
      qc.invalidateQueries({ queryKey: ['projects'] })
      alert(`Imported ${result.importedProjects} project(s), ${result.importedSongs} song(s), ${result.importedTasks} task(s).`)
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <img
          src="/studio-kanban.png"
          alt="Studio Kanban"
          className={styles.logoImg}
        />
      </div>

      <div className={styles.projectListLabel}>
        <Term variant="label" as="label">Projects</Term>
      </div>

      <nav className={styles.projectList}>
        {isLoading && (
          <div className={styles.loading}>
            <Term variant="muted">Loading…</Term>
          </div>
        )}
        {projects?.map((project) => (
          <button
            key={project.id}
            className={[
              styles.projectItem,
              project.id === activeProjectId ? styles.active : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveProjectId(project.id)}
            onContextMenu={(e) => {
              e.preventDefault()
              openEditProject(project.id)
            }}
            title={project.name}
          >
            <Term className={styles.projectName}>{project.name}</Term>
          </button>
        ))}
        {!isLoading && (!projects || projects.length === 0) && (
          <div className={styles.empty}>
            <Term variant="muted">No projects yet</Term>
          </div>
        )}
      </nav>

      <div className={styles.footer}>
        <Button variant="ghost" size="sm" onClick={openCreateProject} className={styles.newBtn}>
          <Term>+ New Project</Term>
        </Button>
        <div className={styles.dataActions}>
          <Button variant="ghost" size="sm" onClick={handleExport} className={styles.dataBtn}>
            <Term>Export</Term>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => importRef.current?.click()} className={styles.dataBtn}>
            <Term>Import</Term>
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className={styles.hiddenInput}
            onChange={handleImportFile}
          />
        </div>
        {session?.user && (
          <div className={styles.user}>
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name ?? ''} className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>
                <Term>{(session.user.name ?? '?')[0].toUpperCase()}</Term>
              </div>
            )}
            <Term className={styles.userName} variant="muted">{session.user.name}</Term>
            <button
              className={styles.signOutBtn}
              onClick={() => authClient.signOut()}
              aria-label="Sign out"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
