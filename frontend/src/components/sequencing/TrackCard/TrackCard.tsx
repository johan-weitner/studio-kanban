import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SequenceTrack } from '../../../hooks/useSequence'
import { Term } from '../../ui/Term/Term'
import styles from './TrackCard.module.css'

interface TrackCardProps {
  track: SequenceTrack
  index?: number              // track number (approved only)
  isActive: boolean           // currently playing in the widget
  onPlay: (scTrackId: string) => void
}

function artworkThumb(url: string | null): string | null {
  if (!url) return null
  // SoundCloud artwork URLs end in -large.jpg — swap for a smaller square
  return url.replace('-large.', '-t200x200.')
}

export function TrackCard({ track, index, isActive, onPlay }: TrackCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
    data: { track },
  })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const thumb = artworkThumb(track.artworkUrl)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        styles.card,
        isActive ? styles.active : '',
        isDragging ? styles.dragging : '',
      ].filter(Boolean).join(' ')}
      {...attributes}
      {...listeners}
      onClick={() => { if (!isDragging) onPlay(track.scTrackId) }}
    >
      {index !== undefined && (
        <span className={styles.trackNumber}>{index + 1}</span>
      )}
      <div className={styles.artwork}>
        {thumb ? (
          <img src={thumb} alt={track.title} className={styles.artworkImg} />
        ) : (
          <div className={styles.artworkFallback} />
        )}
      </div>
      <div className={styles.meta}>
        <Term className={styles.title}>{track.title}</Term>
        {isActive && (
          <span className={styles.playingBadge}>▶ Playing</span>
        )}
      </div>
    </div>
  )
}
