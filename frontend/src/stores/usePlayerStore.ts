import { create } from 'zustand'

export interface PlayerControls {
  play: () => void
  pause: () => void
  seekTo: (ms: number) => void
  getPosition: (callback: (ms: number) => void) => void
}

interface PlayerStore {
  activeScTrackId: string | null
  isPlaying: boolean
  repeatEnabled: boolean

  /** Raw widget controls — registered by PlaylistPlayer on READY */
  playerControls: PlayerControls | null

  /** Plays a specific track by scTrackId — registered by PlaylistPlayer on READY */
  playTrack: ((scTrackId: string) => void) | null

  // Actions
  setActiveTrack: (id: string | null) => void
  setIsPlaying: (playing: boolean) => void
  toggleRepeat: () => void
  setRepeatEnabled: (enabled: boolean) => void
  registerPlayerControls: (controls: PlayerControls) => void
  unregisterPlayerControls: () => void
  registerPlayTrack: (fn: (scTrackId: string) => void) => void
  unregisterPlayTrack: () => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  activeScTrackId: null,
  isPlaying: false,
  repeatEnabled: false,
  playerControls: null,
  playTrack: null,

  setActiveTrack: (id) => set({ activeScTrackId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  toggleRepeat: () => set((s) => ({ repeatEnabled: !s.repeatEnabled })),
  setRepeatEnabled: (enabled) => set({ repeatEnabled: enabled }),
  registerPlayerControls: (controls) => set({ playerControls: controls }),
  unregisterPlayerControls: () => set({ playerControls: null }),
  registerPlayTrack: (fn) => set({ playTrack: fn }),
  unregisterPlayTrack: () => set({ playTrack: null }),
}))
