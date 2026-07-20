import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { Song } from '../api/types'

export function useSongs(projectId: string) {
  return useQuery<Song[]>({
    queryKey: ['songs', projectId],
    queryFn: () => apiFetch(`/projects/${projectId}/songs`),
    enabled: !!projectId,
  })
}

export function useCreateSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      ...data
    }: { projectId: string; title: string; description?: string }) =>
      apiFetch<Song>(`/projects/${projectId}/songs`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['songs', variables.projectId] }),
  })
}

export function useUpdateSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      projectId,
      ...data
    }: { id: string; projectId: string; title?: string; description?: string }) =>
      apiFetch<Song>(`/songs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['songs', variables.projectId] }),
  })
}

export function useDeleteSong() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      apiFetch<void>(`/songs/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['songs', variables.projectId] }),
  })
}
