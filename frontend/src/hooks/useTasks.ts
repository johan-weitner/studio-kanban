import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { Task } from '../api/types'

export function useTasks(songId: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', songId],
    queryFn: () => apiFetch(`/songs/${songId}/tasks`),
    enabled: !!songId,
  })
}

export function useTask(taskId: string | null) {
  return useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: () => apiFetch(`/tasks/${taskId}`),
    enabled: !!taskId,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      songId,
      ...data
    }: {
      songId: string
      columnId: string
      title: string
      description?: string
      assignee?: string
    }) =>
      apiFetch<Task>(`/songs/${songId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['tasks', variables.songId] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      songId,
      ...data
    }: {
      id: string
      songId: string
      title?: string
      description?: string
      assignee?: string
      columnId?: string
    }) =>
      apiFetch<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', variables.songId] })
      qc.invalidateQueries({ queryKey: ['task', variables.id] })
    },
  })
}

export function useMoveTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      columnId: string
      songId?: string
      order?: number
      fromSongId: string
    }) =>
      apiFetch<Task>(`/tasks/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ columnId: data.columnId, songId: data.songId, order: data.order }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', variables.fromSongId] })
      if (variables.songId && variables.songId !== variables.fromSongId) {
        qc.invalidateQueries({ queryKey: ['tasks', variables.songId] })
      }
      qc.invalidateQueries({ queryKey: ['task', variables.id] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, songId }: { id: string; songId: string }) =>
      apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', variables.songId] })
      qc.invalidateQueries({ queryKey: ['task', variables.id] })
    },
  })
}
