import { useEffect, useRef, useCallback } from 'react'
import styles from './PlaylistPlayer.module.css'

interface SCWidget {
  bind: (event: string, callback: (data?: unknown) => void) => void
  skip: (index: number) => void
  play: () => void
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
  /** Called when the widget changes track (via its own controls) */
  onTrackChange: (scTrackId: string) => void
  /** Imperative handle — parent sets this to trigger playTrack */
  onReady: (playTrack: (scTrackId: string) => void) => void
}

export function PlaylistPlayer({ playlistUrl, secretToken, onTrackChange, onReady }: PlaylistPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SCWidget | null>(null)
  const trackIndexMapRef = useRef<Map<string, number>>(new Map())
  const readyRef = useRef(false)

  // The SoundCloud Widget accepts `secret_token` as its own query param,
  // separate from the encoded playlist URL.
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
    // Load the SC Widget API script once
    if (!document.getElementById('sc-widget-api')) {
      const script = document.createElement('script')
      script.id = 'sc-widget-api'
      script.src = 'https://w.soundcloud.com/player/api.js'
      document.body.appendChild(script)
    }

    // Wait for both the script and the iframe to be ready
    const init = () => {
      if (!iframeRef.current || !window.SC) return

      const widget = window.SC.Widget(iframeRef.current)
      widgetRef.current = widget

      widget.bind(window.SC.Widget.Events.READY, () => {
        // Build track ID → playlist index map
        widget.getSounds((sounds) => {
          sounds.forEach((sound, index) => {
            trackIndexMapRef.current.set(String(sound.id), index)
          })
          readyRef.current = true
          onReady(playTrack)
        })
      })

      widget.bind(window.SC.Widget.Events.PLAY, () => {
        widget.getCurrentSound((sound) => {
          if (sound) onTrackChange(String(sound.id))
        })
      })
    }

    // The SC script might already be loaded, or we need to wait
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
        height="128"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={src}
        title="SoundCloud playlist player"
      />
    </div>
  )
}
