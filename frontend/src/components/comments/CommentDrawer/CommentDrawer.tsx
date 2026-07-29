import { useState, useEffect, useRef } from 'react'
import { useUIStore } from '../../../stores/useUIStore'
import { authClient } from '../../../auth'
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '../../../hooks/useComments'
import type { Comment } from '../../../hooks/useComments'
import { Term } from '../../ui/Term/Term'
import styles from './CommentDrawer.module.css'

// ── Formatting helpers ────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ── Single comment row ────────────────────────────────────────────────────

function CommentRow({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  isReply,
}: {
  comment: Comment
  currentUserId: string | undefined
  onReply: (comment: Comment) => void
  onEdit: (comment: Comment) => void
  onDelete: (comment: Comment) => void
  isReply?: boolean
}) {
  const isOwn = comment.authorId === currentUserId
  return (
    <div className={[styles.comment, isReply ? styles.reply : ''].filter(Boolean).join(' ')}>
      <div className={styles.commentHeader}>
        {comment.authorImage ? (
          <img src={comment.authorImage} alt={comment.authorName} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>
            <Term>{comment.authorName[0]?.toUpperCase() ?? '?'}</Term>
          </div>
        )}
        <div className={styles.authorMeta}>
          <Term className={styles.authorName}>{comment.authorName}</Term>
          <Term variant="muted" className={styles.timestamp}>{timeAgo(comment.createdAt)}</Term>
          {comment.updatedAt !== comment.createdAt && (
            <Term variant="muted" className={styles.timestamp}>(edited)</Term>
          )}
        </div>
        {isOwn && (
          <div className={styles.commentActions}>
            <button className={styles.actionBtn} onClick={() => onEdit(comment)} aria-label="Edit comment">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button className={styles.actionBtn} onClick={() => onDelete(comment)} aria-label="Delete comment">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      <Term className={styles.commentBody}>{comment.body}</Term>
      {!isReply && (
        <button className={styles.replyBtn} onClick={() => onReply(comment)}>
          <Term variant="muted">Reply</Term>
        </button>
      )}
    </div>
  )
}

// ── Main drawer ───────────────────────────────────────────────────────────

export function CommentDrawer() {
  const target = useUIStore((s) => s.commentTarget)
  const close = useUIStore((s) => s.closeCommentDrawer)
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  const { data: thread } = useComments(target)
  const createComment = useCreateComment(target!)
  const updateComment = useUpdateComment(target!)
  const deleteComment = useDeleteComment(target!)

  const [newBody, setNewBody] = useState('')
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [editBody, setEditBody] = useState('')

  const newBodyRef = useRef<HTMLTextAreaElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [close])

  // Focus input when drawer opens
  useEffect(() => {
    if (target) setTimeout(() => newBodyRef.current?.focus(), 100)
    setNewBody('')
    setReplyingTo(null)
    setEditingComment(null)
  }, [target?.type === 'song' ? (target as { id: string }).id : (target as { projectId?: string } | null)?.projectId])

  if (!target) return null

  const handlePost = () => {
    if (!newBody.trim()) return
    createComment.mutate({ body: newBody.trim() })
    setNewBody('')
  }

  const handleReplyPost = () => {
    if (!replyBody.trim() || !replyingTo) return
    createComment.mutate({ body: replyBody.trim(), parentId: replyingTo.id })
    setReplyBody('')
    setReplyingTo(null)
  }

  const handleEditSave = () => {
    if (!editBody.trim() || !editingComment) return
    updateComment.mutate({ id: editingComment.id, body: editBody.trim() })
    setEditingComment(null)
    setEditBody('')
  }

  const handleDelete = (comment: Comment) => {
    if (!window.confirm('Delete this comment?')) return
    deleteComment.mutate({ id: comment.id })
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment)
    setEditBody(comment.body)
    setReplyingTo(null)
  }

  const startReply = (comment: Comment) => {
    setReplyingTo(comment)
    setReplyBody('')
    setEditingComment(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={close} />

      {/* Drawer panel */}
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <Term className={styles.drawerTitleText}>{target.title}</Term>
          </div>
          <button className={styles.closeBtn} onClick={close} aria-label="Close comments">×</button>
        </div>

        <div className={styles.thread}>
          {(!thread || (thread.topLevel.length === 0)) && (
            <div className={styles.emptyThread}>
              <Term variant="muted">No comments yet. Be the first!</Term>
            </div>
          )}

          {thread?.topLevel.map((comment) => (
            <div key={comment.id}>
              {editingComment?.id === comment.id ? (
                <div className={styles.editBox}>
                  <textarea
                    className={styles.textarea}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className={styles.inputActions}>
                    <button className={styles.cancelBtn} onClick={() => setEditingComment(null)}>
                      <Term variant="muted">Cancel</Term>
                    </button>
                    <button className={styles.postBtn} onClick={handleEditSave} disabled={!editBody.trim()}>
                      <Term>Save</Term>
                    </button>
                  </div>
                </div>
              ) : (
                <CommentRow
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={startReply}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              )}

              {/* Replies */}
              {(thread.replies[comment.id] ?? []).map((reply) => (
                editingComment?.id === reply.id ? (
                  <div key={reply.id} className={[styles.editBox, styles.reply].join(' ')}>
                    <textarea
                      className={styles.textarea}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={2}
                      autoFocus
                    />
                    <div className={styles.inputActions}>
                      <button className={styles.cancelBtn} onClick={() => setEditingComment(null)}>
                        <Term variant="muted">Cancel</Term>
                      </button>
                      <button className={styles.postBtn} onClick={handleEditSave} disabled={!editBody.trim()}>
                        <Term>Save</Term>
                      </button>
                    </div>
                  </div>
                ) : (
                  <CommentRow
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={() => {}}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    isReply
                  />
                )
              ))}

              {/* Reply input */}
              {replyingTo?.id === comment.id && (
                <div className={[styles.replyInput, styles.reply].join(' ')}>
                  <textarea
                    className={styles.textarea}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReplyPost() }}
                  />
                  <div className={styles.inputActions}>
                    <button className={styles.cancelBtn} onClick={() => setReplyingTo(null)}>
                      <Term variant="muted">Cancel</Term>
                    </button>
                    <button className={styles.postBtn} onClick={handleReplyPost} disabled={!replyBody.trim()}>
                      <Term>Reply</Term>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* New top-level comment */}
        <div className={styles.newComment}>
          <textarea
            ref={newBodyRef}
            className={styles.textarea}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Add a comment… (⌘↵ to post)"
            rows={3}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost() }}
          />
          <div className={styles.inputActions}>
            <button
              className={styles.postBtn}
              onClick={handlePost}
              disabled={!newBody.trim() || createComment.isPending}
            >
              <Term>{createComment.isPending ? 'Posting…' : 'Post'}</Term>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
