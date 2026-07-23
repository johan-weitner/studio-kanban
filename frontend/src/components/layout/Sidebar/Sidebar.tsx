import styles from './Sidebar.module.css'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import { useProjects } from '../../../hooks/useProjects'
import { useUIStore } from '../../../stores/useUIStore'
import { authClient } from '../../../auth'

export function Sidebar() {
  const { data: projects, isLoading } = useProjects()
  const activeProjectId = useUIStore((s) => s.activeProjectId)
  const setActiveProjectId = useUIStore((s) => s.setActiveProjectId)
  const openCreateProject = useUIStore((s) => s.openCreateProject)
  const openEditProject = useUIStore((s) => s.openEditProject)
  const { data: session } = authClient.useSession()

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
