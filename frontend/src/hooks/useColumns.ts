import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { Column } from '../api/types'

export function useColumns(projectId: string) {
  return useQuery<Column[]>({
    queryKey: ['columns', projectId],
    queryFn: () => apiFetch(`/projects/${projectId}/columns`),
    enabled: !!projectId,
  })
}

export function useCreateColumn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      ...data
    }: { projectId: string; name: string; color?: string }) =>
      apiFetch<Column>(`/projects/${projectId}/columns`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['columns', variables.projectId] }),
  })
}

export function useUpdateColumn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      projectId,
      ...data
    }: { id: string; projectId: string; name?: string; color?: string }) =>
      apiFetch<Column>(`/columns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['columns', variables.projectId] }),
  })
}

export function useDeleteColumn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) =>
      apiFetch<void>(`/columns/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['columns', variables.projectId] }),
  })
}
