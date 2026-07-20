export interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  projectId: string
  name: string
  color: string
  order: number
  createdAt: string
}

export interface Song {
  id: string
  projectId: string
  title: string
  description: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  songId: string
  columnId: string
  title: string
  description: string | null
  assignee: string | null
  order: number
  createdAt: string
  updatedAt: string
  subtasks?: Subtask[]
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  order: number
  createdAt: string
}
