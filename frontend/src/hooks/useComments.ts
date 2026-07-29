import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import type { CommentTarget } from '../stores/useUIStore'

export interface Comment {
  id: string
  authorId: string
  authorName: string
  authorImage: string | null
  body: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface ThreadData {
  topLevel: Comment[]
  replies: Record<string, Comment[]>
}

function targetKey(target: CommentTarget): unknown[] {
  if (target.type === 'song') return ['comments', 'song', target.id]
  return ['comments', 'sequence', target.projectId]
}

function targetUrl(target: CommentTarget): string {
  if (target.type === 'song') return `/songs/${target.id}/comments`
  return `/projects/${target.projectId}/sequence/comments`
}

export interface CommentCounts {
  bySong: Record<string, number>
  sequence: number
}

export function useCommentCounts(projectId: string | null) {
  return useQuery<CommentCounts>({
    queryKey: ['comment-counts', projectId],
    queryFn: () => apiFetch(`/projects/${projectId}/comment-counts`),
    enabled: !!projectId,
  })
}

export function useComments(target: CommentTarget | null) {
  return useQuery<ThreadData>({
    queryKey: target ? targetKey(target) : ['comments', 'none'],
    queryFn: () => apiFetch(targetUrl(target!)),
    enabled: !!target,
  })
}

export function useCreateComment(target: CommentTarget) {
  const qc = useQueryClient()
  const key = targetKey(target)
  return useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId?: string }) =>
      apiFetch<Comment>(targetUrl(target), {
        method: 'POST',
        body: JSON.stringify({ body, parentId }),
      }),
    onSuccess: (newComment) => {
      qc.setQueryData<ThreadData>(key, (old) => {
        if (!old) return old
        if (!newComment.parentId) {
          return { ...old, topLevel: [...old.topLevel, newComment] }
        }
        const existing = old.replies[newComment.parentId] ?? []
        return {
          ...old,
          replies: { ...old.replies, [newComment.parentId]: [...existing, newComment] },
        }
      })
      // Refresh the count badge
      const pid = target.type === 'song'
        ? qc.getQueryData<{ projectId: string }>(['comments', 'song', target.id])
        : { projectId: (target as { projectId: string }).projectId }
      qc.invalidateQueries({ queryKey: ['comment-counts'] })
    },
  })
}

export function useUpdateComment(target: CommentTarget) {
  const qc = useQueryClient()
  const key = targetKey(target)
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      apiFetch<Comment>(`/comments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ body }),
      }),
    onSuccess: (updated) => {
      qc.setQueryData<ThreadData>(key, (old) => {
        if (!old) return old
        const patchList = (list: Comment[]) =>
          list.map((c) => (c.id === updated.id ? updated : c))
        if (!updated.parentId) {
          return { ...old, topLevel: patchList(old.topLevel) }
        }
        return {
          ...old,
          replies: {
            ...old.replies,
            [updated.parentId]: patchList(old.replies[updated.parentId] ?? []),
          },
        }
      })
    },
  })
}

export function useDeleteComment(target: CommentTarget) {
  const qc = useQueryClient()
  const key = targetKey(target)
  return useMutation({
    mutationFn: ({ id }: { id: string; parentId?: string }) =>
      apiFetch<void>(`/comments/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      qc.setQueryData<ThreadData>(key, (old) => {
        if (!old) return old
        // Remove from topLevel (and clear its replies)
        const topLevelFiltered = old.topLevel.filter((c) => c.id !== variables.id)
        const repliesWithoutParent = { ...old.replies }
        delete repliesWithoutParent[variables.id]
        // Also remove from any reply list
        const repliesFiltered = Object.fromEntries(
          Object.entries(repliesWithoutParent).map(([pid, list]) => [
            pid,
            list.filter((c) => c.id !== variables.id),
          ])
        )
        return { topLevel: topLevelFiltered, replies: repliesFiltered }
      })
      qc.invalidateQueries({ queryKey: ['comment-counts'] })
    },
  })
}
