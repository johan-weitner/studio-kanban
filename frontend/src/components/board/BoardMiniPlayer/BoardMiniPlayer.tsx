import { usePlayerStore } from '../../../stores/usePlayerStore'
import { useSequence } from '../../../hooks/useSequence'
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

  // Find the active track in sequence data to get its permalink URL for the iframe
  const allTracks = [...(sequenceData?.approved ?? []), ...(sequenceData?.unapproved ?? [])]
  const activeTrack = allTracks.find((t) => t.scTrackId === activeScTrackId)
  const secretToken = sequenceData?.secretToken

  // Build the mini-player iframe src — single-track embed, auto_play=false (visual only)
  const iframeSrc = activeTrack
    ? [
        'https://w.soundcloud.com/player/',
        `?url=${encodeURIComponent(activeTrack.permalinkUrl)}`,
        secretToken ? `&secret_token=${encodeURIComponent(secretToken)}` : '',
        '&color=%23dd7b77',
        '&auto_play=false',
        '&show_user=false',
        '&hide_related=true',
        '&show_comments=false',
        '&show_reposts=false',
        '&show_teaser=false',
        '&inverse=false',
      ].join('')
    : null

  const seekBack = () => playerControls.getPosition((pos) => playerControls.seekTo(Math.max(0, pos - 15000)))
  const seekForward = () => playerControls.getPosition((pos) => playerControls.seekTo(pos + 15000))
  const togglePlay = () => (isPlaying ? playerControls.pause() : playerControls.play())

  return (
    <div className={styles.miniPlayer}>
      {iframeSrc && (
        <div className={styles.iframeWrap}>
          <iframe
            key={activeScTrackId}
            width="100%"
            height="20"
            scrolling="no"
            frameBorder="no"
            allow="autoplay; encrypted-media"
            src={iframeSrc}
            title="Now playing"
          />
        </div>
      )}
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
