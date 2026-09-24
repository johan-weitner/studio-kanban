import { usePlayerStore } from '../../../stores/usePlayerStore'
import { useSequence } from '../../../hooks/useSequence'
import { Term } from '../../ui/Term/Term'
import styles from './BoardMiniPlayer.module.css'

interface BoardMiniPlayerProps {
  projectId: string
}

export function BoardMiniPlayer({ projectId }: BoardMiniPlayerProps) {
  const activeScTrackId = usePlayerStore((s) => s.activeScTrackId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const repeatEnabled = usePlayerStore((s) => s.repeatEnabled)
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat)
  const playerControls = usePlayerStore((s) => s.playerControls)
  const { data: sequenceData } = useSequence(projectId)

  if (!activeScTrackId || !playerControls) return null

  // Find the active track to display its title
  const allTracks = [...(sequenceData?.approved ?? []), ...(sequenceData?.unapproved ?? [])]
  const activeTrack = allTracks.find((t) => t.scTrackId === activeScTrackId)

  const seekBack = () => playerControls.getPosition((pos) => playerControls.seekTo(Math.max(0, pos - 15000)))
  const seekForward = () => playerControls.getPosition((pos) => playerControls.seekTo(pos + 15000))
  const togglePlay = () => (isPlaying ? playerControls.pause() : playerControls.play())

  return (
    <div className={styles.miniPlayer}>
      <div className={styles.trackInfo}>
        {isPlaying ? (
          <span className={styles.playingDot} aria-hidden="true" />
        ) : null}
        <Term variant="muted" className={styles.trackTitle}>
          {activeTrack?.title ?? 'Now playing'}
        </Term>
      </div>
      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          onClick={seekBack}
          aria-label="Seek back 15 seconds"
          title="−15s"
        >
          ↺
        </button>
        <button
          className={styles.controlBtn}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className={styles.controlBtn}
          onClick={seekForward}
          aria-label="Seek forward 15 seconds"
          title="+15s"
        >
          ↻
        </button>
        <button
          className={[styles.controlBtn, repeatEnabled ? styles.controlBtnActive : ''].filter(Boolean).join(' ')}
          onClick={toggleRepeat}
          aria-label={repeatEnabled ? 'Repeat on' : 'Repeat off'}
          title="Repeat"
        >
          ⟳
        </button>
      </div>
    </div>
  )
}
