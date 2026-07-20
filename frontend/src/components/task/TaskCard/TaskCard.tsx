import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../../api/types'
import { Term } from '../../ui/Term/Term'
import { Badge } from '../../ui/Badge/Badge'
import { useUIStore } from '../../../stores/useUIStore'
import { useDeleteTask } from '../../../hooks/useTasks'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const openTaskDetail = useUIStore((s) => s.openTaskDetail)
  const deleteTask = useDeleteTask()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const subtasks = task.subtasks ?? []
  const completedCount = subtasks.filter((s) => s.completed).length
  const totalCount = subtasks.length

  const handleClick = () => {
    if (!isDragging) {
      openTaskDetail(task.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete “${task.title}”?`)) {
      deleteTask.mutate({ id: task.id, songId: task.songId })
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[styles.card, isDragging ? styles.dragging : ''].filter(Boolean).join(' ')}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <div className={styles.header}>
        <Term className={styles.title}>{task.title}</Term>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
      <div className={styles.meta}>
        {task.assignee && (
          <Badge label={task.assignee} color="var(--accent)" />
        )}
        {totalCount > 0 && (
          <Badge
            label={`${completedCount}/${totalCount}`}
            color={completedCount === totalCount ? 'done' : 'in-progress'}
          />
        )}
      </div>
    </div>
  )
}
