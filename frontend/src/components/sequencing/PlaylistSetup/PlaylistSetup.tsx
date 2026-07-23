import { useState } from 'react'
import { Term } from '../../ui/Term/Term'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import styles from './PlaylistSetup.module.css'

interface PlaylistSetupProps {
  onConnect: (url: string, secretToken?: string) => void
  connecting: boolean
}

export function PlaylistSetup({ onConnect, connecting }: PlaylistSetupProps) {
  const [url, setUrl] = useState('')
  const [secretToken, setSecretToken] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    onConnect(url.trim(), secretToken.trim() || undefined)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Term as="h2" variant="heading" className={styles.title}>
          Connect a SoundCloud playlist
        </Term>
        <Term variant="muted" className={styles.subtitle}>
          Paste your SoundCloud playlist URL. For private playlists, paste the full share link — the secret token is extracted automatically.
        </Term>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <Term as="label" variant="label">Playlist URL</Term>
            <Input
              type="url"
              placeholder="https://soundcloud.com/you/sets/my-album or full share link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <Button variant="ghost" size="sm" className={styles.submit}>
            <Term>{connecting ? 'Connecting…' : 'Connect playlist'}</Term>
          </Button>
        </form>
      </div>
    </div>
  )
}
