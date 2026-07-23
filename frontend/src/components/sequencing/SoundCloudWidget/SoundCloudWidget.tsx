import styles from './SoundCloudWidget.module.css'

interface SoundCloudWidgetProps {
  permalinkUrl: string
  secretToken?: string | null
  height?: number
}

export function SoundCloudWidget({ permalinkUrl, secretToken, height = 64 }: SoundCloudWidgetProps) {
  // Build the track URL — include secret token if the playlist/track is private
  const trackUrl = secretToken
    ? `${permalinkUrl}?secret_token=${encodeURIComponent(secretToken)}`
    : permalinkUrl

  const src = [
    'https://w.soundcloud.com/player/',
    `?url=${encodeURIComponent(trackUrl)}`,
    '&color=%23ff5500',
    '&auto_play=false',
    '&hide_related=true',
    '&show_comments=false',
    '&show_user=true',
    '&show_reposts=false',
    '&show_teaser=false',
  ].join('')

  return (
    <iframe
      className={styles.widget}
      width="100%"
      height={height}
      scrolling="no"
      frameBorder="no"
      allow="autoplay"
      src={src}
      title="SoundCloud player"
    />
  )
}
