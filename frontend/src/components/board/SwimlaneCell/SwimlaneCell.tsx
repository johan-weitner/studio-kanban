import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task } from '../../../api/types'
import { TaskCard } from '../../task/TaskCard/TaskCard'
import { Term } from '../../ui/Term/Term'
import { useCreateTask } from '../../../hooks/useTasks'
import styles from './SwimlaneCell.module.css'

interface SwimlaneCellProps {
  songId: string
  columnId: string
  tasks: Task[]
}

export function SwimlaneCell({ songId, columnId, tasks }: SwimlaneCellProps) {
  const droppableId = `${songId}:${columnId}`
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })
  const createTask = useCreateTask()

  const handleAddTask = () => {
    const title = window.prompt('Task title:')
    if (title?.trim()) {
      createTask.mutate({ songId, columnId, title: title.trim() })
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={[styles.cell, isOver ? styles.over : ''].filter(Boolean).join(' ')}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
      <button className={styles.addBtn} onClick={handleAddTask}>
        <Term variant="muted">+ Add task</Term>
      </button>
    </div>
  )
}
