import { create } from 'zustand'

interface UIStore {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
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
}

export const useUIStore = create<UIStore>((set) => ({
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),

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
}))
