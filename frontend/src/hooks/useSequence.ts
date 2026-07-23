import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'

export interface SequenceTrack {
  id: string
  projectId: string
  scTrackId: string
  title: string
  artworkUrl: string | null
  permalinkUrl: string
  status: 'approved' | 'unapproved'
  position: number
  createdAt: string
}

export interface SequenceData {
  approved: SequenceTrack[]
  unapproved: SequenceTrack[]
  playlistUrl: string | null
  secretToken: string | null
}

export function useSequence(projectId: string) {
  return useQuery<SequenceData>({
    queryKey: ['sequence', projectId],
    queryFn: () => apiFetch(`/projects/${projectId}/sequence`),
    enabled: !!projectId,
  })
}

export function useSyncPlaylist(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<{ synced: number; tracks: SequenceTrack[] }>(
        `/projects/${projectId}/soundcloud/sync`,
        { method: 'POST' }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sequence', projectId] }),
  })
}

export function useConnectPlaylist(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ playlistUrl, secretToken }: { playlistUrl: string; secretToken?: string }) =>
      apiFetch(`/projects/${projectId}/soundcloud`, {
        method: 'PATCH',
        body: JSON.stringify({ playlistUrl, secretToken }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sequence', projectId] }),
  })
}

export function useUpdateSequence(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ approved, unapproved }: { approved: string[]; unapproved: string[] }) =>
      apiFetch(`/projects/${projectId}/sequence`, {
        method: 'PUT',
        body: JSON.stringify({ approved, unapproved }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sequence', projectId] }),
  })
}
