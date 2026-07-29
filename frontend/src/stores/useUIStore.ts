import { create } from 'zustand'

export type CommentTarget =
  | { type: 'song'; id: string; title: string }
  | { type: 'sequence'; projectId: string; title: string }

interface UIStore {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  activeView: 'board' | 'sequence'
  setActiveView: (view: 'board' | 'sequence') => void
  taskDetailId: string | null
  openTaskDetail: (taskId: string) => void
  closeTaskDetail: () => void
  isCreateProjectOpen: boolean
  openCreateProject: () => void
  closeCreateProject: () => void
  editProjectId: string | null
  openEditProject: (id: string) => void
  closeEditProject: () => void
  isSongManagerOpen: boolean
  openSongManager: () => void
  closeSongManager: () => void
  isColumnManagerOpen: boolean
  openColumnManager: () => void
  closeColumnManager: () => void
  commentTarget: CommentTarget | null
  openCommentDrawer: (target: CommentTarget) => void
  closeCommentDrawer: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id, activeView: 'board' }),

  activeView: 'board',
  setActiveView: (view) => set({ activeView: view }),

  taskDetailId: null,
  openTaskDetail: (taskId) => set({ taskDetailId: taskId }),
  closeTaskDetail: () => set({ taskDetailId: null }),

  isCreateProjectOpen: false,
  openCreateProject: () => set({ isCreateProjectOpen: true }),
  closeCreateProject: () => set({ isCreateProjectOpen: false }),

  editProjectId: null,
  openEditProject: (id) => set({ editProjectId: id }),
  closeEditProject: () => set({ editProjectId: null }),

  isSongManagerOpen: false,
  openSongManager: () => set({ isSongManagerOpen: true }),
  closeSongManager: () => set({ isSongManagerOpen: false }),

  isColumnManagerOpen: false,
  openColumnManager: () => set({ isColumnManagerOpen: true }),
  closeColumnManager: () => set({ isColumnManagerOpen: false }),

  commentTarget: null,
  // Toggle: clicking the same target closes the drawer
  openCommentDrawer: (target) => set((s) => ({
    commentTarget:
      s.commentTarget &&
      s.commentTarget.type === target.type &&
      (s.commentTarget.type === 'song' && target.type === 'song'
        ? s.commentTarget.id === target.id
        : s.commentTarget.type === 'sequence' && target.type === 'sequence'
          ? s.commentTarget.projectId === target.projectId
          : false)
        ? null
        : target,
  })),
  closeCommentDrawer: () => set({ commentTarget: null }),
}))
