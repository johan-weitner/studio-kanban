import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore } from '../../../stores/usePlayerStore'
import styles from './PlaylistPlayer.module.css'

interface SCWidget {
	bind: (event: string, callback: (data?: unknown) => void) => void
	skip: (index: number) => void
	pause: () => void
	play: () => void
	seekTo: (ms: number) => void
	getPosition: (callback: (ms: number) => void) => void
	getSounds: (callback: (sounds: Array<{ id: number | string }>) => void) => void
	getCurrentSound: (callback: (sound: { id: number | string }) => void) => void
}

declare global {
	interface Window {
		SC?: {
			Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
				Events: {
					READY: string
					PLAY: string
					FINISH: string
				}
			}
		}
	}
}

interface PlaylistPlayerProps {
	playlistUrl: string
	secretToken: string | null
	/** scTrackIds in approved album-sequence order; governs auto-advance after FINISH */
	approvedOrder: string[]
	/** Called when the widget changes track (via its own controls) */
	onTrackChange: (scTrackId: string) => void
	/** Imperative handle — parent sets this to trigger playTrack */
	onReady: (playTrack: (scTrackId: string) => void) => void
}

export function PlaylistPlayer({
	playlistUrl,
	secretToken,
	approvedOrder,
	onTrackChange,
	onReady,
}: PlaylistPlayerProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null)
	const widgetRef = useRef<SCWidget | null>(null)
	const trackIndexMapRef = useRef<Map<string, number>>(new Map())
	const readyRef = useRef(false)
	// Synced refs so event handlers always see latest values without re-binding
	const approvedOrderRef = useRef<string[]>(approvedOrder)
	useEffect(() => { approvedOrderRef.current = approvedOrder }, [approvedOrder])
	const currentTrackIdRef = useRef<string | null>(null)

	// Mirror repeatEnabled from the store into a ref for use inside the FINISH closure
	const repeatEnabledRef = useRef(usePlayerStore.getState().repeatEnabled)
	useEffect(() =>
		usePlayerStore.subscribe((s) => { repeatEnabledRef.current = s.repeatEnabled }),
	[])

	const { registerPlayerControls, registerPlayTrack, setActiveTrack, setIsPlaying } = usePlayerStore.getState()

	const src = [
		'https://w.soundcloud.com/player/',
		`?url=${encodeURIComponent(playlistUrl)}`,
		secretToken ? `&secret_token=${encodeURIComponent(secretToken)}` : '',
		'&color=%23ff5500',
		'&auto_play=false',
		'&hide_related=true',
		'&show_comments=false',
		'&show_user=true',
		'&show_reposts=false',
		'&show_teaser=false',
		'&show_artwork=false',
	].join('')

	const playTrack = useCallback((scTrackId: string) => {
		const widget = widgetRef.current
		if (!widget || !readyRef.current) return
		const index = trackIndexMapRef.current.get(scTrackId)
		if (index === undefined) return
		widget.skip(index)
		widget.play()
	}, [])

	useEffect(() => {
		if (!document.getElementById('sc-widget-api')) {
			const script = document.createElement('script')
			script.id = 'sc-widget-api'
			script.src = 'https://w.soundcloud.com/player/api.js'
			document.body.appendChild(script)
		}

		const init = () => {
			if (!iframeRef.current || !window.SC) return

			const widget = window.SC.Widget(iframeRef.current)
			widgetRef.current = widget

			widget.bind(window.SC.Widget.Events.READY, () => {
				widget.getSounds((sounds) => {
					sounds.forEach((sound, index) => {
						trackIndexMapRef.current.set(String(sound.id), index)
					})
					readyRef.current = true

					// Register in parent (SequencingView) and in global store
					onReady(playTrack)
					registerPlayTrack(playTrack)
					registerPlayerControls({
						play: () => widget.play(),
						pause: () => widget.pause(),
						seekTo: (ms) => widget.seekTo(ms),
						getPosition: (cb) => widget.getPosition(cb),
					})
				})
			})

			widget.bind(window.SC.Widget.Events.PLAY, () => {
				widget.getCurrentSound((sound) => {
					if (sound) {
						const id = String(sound.id)
						currentTrackIdRef.current = id
						onTrackChange(id)       // SequencingView highlight
						setActiveTrack(id)      // global store
						setIsPlaying(true)
					}
				})
			})

			// Intercept every FINISH to enforce playback rules:
			// • Repeat on              → replay current track
			// • Approved, not last    → play next in album sequence order
			// • Approved, last        → stop
			// • Unapproved            → stop
			widget.bind(window.SC.Widget.Events.FINISH, () => {
				const currentId = currentTrackIdRef.current
				if (!currentId) return

				if (repeatEnabledRef.current) {
					const idx = trackIndexMapRef.current.get(currentId)
					if (idx !== undefined) {
						widget.skip(idx)
						widget.play()
					}
					return
				}

				const order = approvedOrderRef.current
				const pos = order.indexOf(currentId)
				if (pos !== -1 && pos < order.length - 1) {
					const nextId = order[pos + 1]
					const nextIndex = trackIndexMapRef.current.get(nextId)
					if (nextIndex !== undefined) {
						widget.skip(nextIndex)
						widget.play()
					}
				} else {
					widget.pause()
					const idx = trackIndexMapRef.current.get(currentId)
					if (idx !== undefined) widget.skip(idx)
					setIsPlaying(false)
				}
			})
		}

		const checkReady = setInterval(() => {
			if (window.SC && iframeRef.current) {
				clearInterval(checkReady)
				init()
			}
		}, 100)

		return () => clearInterval(checkReady)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className={styles.player}>
			<iframe
				ref={iframeRef}
				className={styles.iframe}
				width="100%"
				height="166"
				scrolling="no"
				frameBorder="no"
				allow="autoplay"
				src={src}
				title="SoundCloud playlist player"
			/>
		</div>
	)
}
