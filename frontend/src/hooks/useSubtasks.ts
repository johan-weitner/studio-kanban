import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { Subtask } from '../api/types'

export function useSubtasks(taskId: string) {
  return useQuery<Subtask[]>({
    queryKey: ['subtasks', taskId],
    queryFn: () => apiFetch(`/tasks/${taskId}/subtasks`),
    enabled: !!taskId,
  })
}

export function useCreateSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, songId: _s, title }: { taskId: string; songId: string; title: string }) =>
      apiFetch<Subtask>(`/tasks/${taskId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    onSuccess: (newSubtask, variables) => {
      // Immediately append to cache so the UI updates without waiting for a refetch
      qc.setQueryData<Subtask[]>(
        ['subtasks', variables.taskId],
        (old) => [...(old ?? []), newSubtask]
      )
      // Invalidate both the single-task query (for the detail view) and the
      // song's task list (for the board card badge)
      qc.invalidateQueries({ queryKey: ['task', variables.taskId] })
      qc.invalidateQueries({ queryKey: ['tasks', variables.songId] })
    },
  })
}

export function useUpdateSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      taskId,
      songId: _s,
      ...data
    }: { id: string; taskId: string; songId: string; title?: string; completed?: boolean }) =>
      apiFetch<Subtask>(`/subtasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['subtasks', variables.taskId] })
      qc.invalidateQueries({ queryKey: ['task', variables.taskId] })
      qc.invalidateQueries({ queryKey: ['tasks', variables.songId] })
    },
  })
}

export function useDeleteSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string; songId: string }) =>
      apiFetch<void>(`/subtasks/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      // Immediately remove from cache so the UI updates without waiting for a refetch
      qc.setQueryData<Subtask[]>(
        ['subtasks', variables.taskId],
        (old) => (old ?? []).filter((s) => s.id !== variables.id)
      )
      qc.invalidateQueries({ queryKey: ['task', variables.taskId] })
      qc.invalidateQueries({ queryKey: ['tasks', variables.songId] })
    },
  })
}
