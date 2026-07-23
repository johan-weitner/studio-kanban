import { useState } from 'react'
import { authClient } from '../../../auth'
import { Term } from '../../ui/Term/Term'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const [mode, setMode] = useState<'google' | 'email'>('google')
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin,
    })
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({ name, email, password, callbackURL: window.location.origin })
        if (result.error) setError(result.error.message ?? 'Sign up failed')
      } else {
        const result = await authClient.signIn.email({ email, password, callbackURL: window.location.origin })
        if (result.error) setError(result.error.message ?? 'Sign in failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src="/studio-kanban.png" alt="Studio Kanban" className={styles.logo} />
        <Term variant="muted" className={styles.tagline}>Track your production workflow</Term>

        {mode === 'google' ? (
          <>
            <button className={styles.googleBtn} onClick={handleGoogleSignIn}>
              <GoogleIcon />
              <Term className={styles.googleBtnText}>Sign in with Google</Term>
            </button>
            <button className={styles.switchLink} onClick={() => setMode('email')}>
              <Term variant="muted">Use email instead</Term>
            </button>
          </>
        ) : (
          <form className={styles.emailForm} onSubmit={handleEmailSubmit}>
            {isSignUp && (
              <input
                className={styles.emailInput}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              className={styles.emailInput}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={styles.emailInput}
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {error && <Term className={styles.errorMsg}>{error}</Term>}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              <Term>{loading ? '…' : isSignUp ? 'Create account' : 'Sign in'}</Term>
            </button>
            <div className={styles.formFooter}>
              <button type="button" className={styles.switchLink} onClick={() => setIsSignUp((v) => !v)}>
                <Term variant="muted">{isSignUp ? 'Already have an account? Sign in' : 'No account? Sign up'}</Term>
              </button>
              <button type="button" className={styles.switchLink} onClick={() => setMode('google')}>
                <Term variant="muted">Use Google instead</Term>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
