import { useState, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import {
  useSequence,
  useConnectPlaylist,
  useSyncPlaylist,
  useUpdateSequence,
} from '../../../hooks/useSequence'
import type { SequenceTrack } from '../../../hooks/useSequence'
import { PlaylistPlayer } from '../PlaylistPlayer/PlaylistPlayer'
import { TrackCard } from '../TrackCard/TrackCard'
import { PlaylistSetup } from '../PlaylistSetup/PlaylistSetup'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import styles from './SequencingView.module.css'

interface SequencingViewProps {
  projectId: string
}

function ApprovedZone({
  tracks,
  activeScTrackId,
  onPlay,
}: {
  tracks: SequenceTrack[]
  activeScTrackId: string | null
  onPlay: (scTrackId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'approved-zone' })
  return (
    <div ref={setNodeRef} className={[styles.approvedZone, isOver ? styles.zoneOver : ''].filter(Boolean).join(' ')}>
      <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tracks.length === 0 ? (
          <div className={styles.empty}>
            <Term variant="muted">Drag tracks here to build your album sequence</Term>
          </div>
        ) : (
          tracks.map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              index={i}
              isActive={activeScTrackId === track.scTrackId}
              onPlay={onPlay}
            />
          ))
        )}
      </SortableContext>
    </div>
  )
}

function UnapprovedZone({
  tracks,
  activeScTrackId,
  onPlay,
}: {
  tracks: SequenceTrack[]
  activeScTrackId: string | null
  onPlay: (scTrackId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unapproved-zone' })
  return (
    <div ref={setNodeRef} className={[styles.zone, isOver ? styles.zoneOver : ''].filter(Boolean).join(' ')}>
      <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tracks.length === 0 ? (
          <div className={styles.empty}>
            <Term variant="muted">All tracks approved — drag here to un-approve</Term>
          </div>
        ) : (
          tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isActive={activeScTrackId === track.scTrackId}
              onPlay={onPlay}
            />
          ))
        )}
      </SortableContext>
    </div>
  )
}

export function SequencingView({ projectId }: SequencingViewProps) {
  const { data, isLoading } = useSequence(projectId)
  const connectPlaylist = useConnectPlaylist(projectId)
  const syncPlaylist = useSyncPlaylist(projectId)
  const updateSequence = useUpdateSequence(projectId)

  const [approved, setApproved] = useState<SequenceTrack[]>([])
  const [unapproved, setUnapproved] = useState<SequenceTrack[]>([])
  const [activeTrack, setActiveTrack] = useState<SequenceTrack | null>(null)
  const [activeScTrackId, setActiveScTrackId] = useState<string | null>(null)
  const [synced, setSynced] = useState(false)
  const playTrackRef = useRef<(scTrackId: string) => void>(() => {})

  // Sync local state from server when data first arrives or when explicitly reset.
  if (data && !synced) {
    setApproved(data.approved)
    setUnapproved(data.unapproved)
    setSynced(true)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const playTrack = (scTrackId: string) => {
    setActiveScTrackId(scTrackId)
    playTrackRef.current(scTrackId)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const track = event.active.data.current?.track as SequenceTrack
    setActiveTrack(track ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTrack(null)
    const { active, over } = event
    if (!over) return

    const activeTrackData = active.data.current?.track as SequenceTrack
    if (!activeTrackData) return

    const overId = String(over.id)
    const fromApproved = approved.some((t) => t.id === active.id)
    const toApproved = approved.some((t) => t.id === overId) || overId === 'approved-zone'
    const toUnapproved = unapproved.some((t) => t.id === overId) || overId === 'unapproved-zone'

    let nextApproved = [...approved]
    let nextUnapproved = [...unapproved]

    if (fromApproved && toApproved) {
      const oldIdx = nextApproved.findIndex((t) => t.id === active.id)
      const newIdx = nextApproved.findIndex((t) => t.id === overId)
      if (oldIdx !== -1 && newIdx !== -1) nextApproved = arrayMove(nextApproved, oldIdx, newIdx)
    } else if (!fromApproved && toApproved) {
      nextUnapproved = nextUnapproved.filter((t) => t.id !== active.id)
      const insertAt = nextApproved.findIndex((t) => t.id === overId)
      if (insertAt === -1) nextApproved.push(activeTrackData)
      else nextApproved.splice(insertAt, 0, activeTrackData)
    } else if (fromApproved && toUnapproved) {
      nextApproved = nextApproved.filter((t) => t.id !== active.id)
      nextUnapproved.push(activeTrackData)
    }

    setApproved(nextApproved)
    setUnapproved(nextUnapproved)
    updateSequence.mutate({
      approved: nextApproved.map((t) => t.id),
      unapproved: nextUnapproved.map((t) => t.id),
    })
  }

  if (!isLoading && data && !data.playlistUrl) {
    return (
      <PlaylistSetup
        connecting={connectPlaylist.isPending}
        onConnect={async (url, secretToken) => {
          await connectPlaylist.mutateAsync({ playlistUrl: url, secretToken })
          setSynced(false)
          syncPlaylist.mutate()
        }}
      />
    )
  }

  if (isLoading || !data) {
    return (
      <div className={styles.loading}>
        <Term variant="muted">Loading sequence…</Term>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={styles.view}>
        {data.playlistUrl && (
          <PlaylistPlayer
            playlistUrl={data.playlistUrl}
            secretToken={data.secretToken}
            onTrackChange={setActiveScTrackId}
            onReady={(fn) => { playTrackRef.current = fn }}
          />
        )}

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <Term variant="label" className={styles.panelTitle}>Album sequence</Term>
            <Term variant="muted" className={styles.panelCount}>{approved.length} track{approved.length !== 1 ? 's' : ''}</Term>
          </div>
          <ApprovedZone tracks={approved} activeScTrackId={activeScTrackId} onPlay={playTrack} />
        </section>

        <div className={styles.divider} />

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <Term variant="label" className={styles.panelTitle}>Unapproved tracks</Term>
            <Term variant="muted" className={styles.panelCount}>{unapproved.length} track{unapproved.length !== 1 ? 's' : ''}</Term>
            <Button variant="ghost" size="sm" onClick={() => { setSynced(false); syncPlaylist.mutate(); }}>
              <Term>{syncPlaylist.isPending ? 'Syncing…' : 'Sync playlist'}</Term>
            </Button>
          </div>
          <UnapprovedZone tracks={unapproved} activeScTrackId={activeScTrackId} onPlay={playTrack} />
        </section>
      </div>

      <DragOverlay>
        {activeTrack && (
          <div className={styles.overlay}>
            <TrackCard track={activeTrack} isActive={activeScTrackId === activeTrack.scTrackId} onPlay={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
