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
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      apiFetch<Subtask>(`/tasks/${taskId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['subtasks', variables.taskId] })
      qc.invalidateQueries({ queryKey: ['task', variables.taskId] })
    },
  })
}

export function useUpdateSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      taskId,
      ...data
    }: { id: string; taskId: string; title?: string; completed?: boolean }) =>
      apiFetch<Subtask>(`/subtasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['subtasks', variables.taskId] })
      qc.invalidateQueries({ queryKey: ['task', variables.taskId] })
    },
  })
}

export function useDeleteSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, taskId }: { id: string; taskId: string }) =>
      apiFetch<void>(`/subtasks/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['subtasks', variables.taskId] })
      qc.invalidateQueries({ queryKey: ['task', variables.taskId] })
    },
  })
}
