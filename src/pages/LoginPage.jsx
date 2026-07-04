import { useState } from 'react'
import { Zap, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './AuthLayout.module.css'

export default function LoginPage({ onNavigate }) {
  const { login, status, error, clearError } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [touched, setTouched]   = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit  = emailValid && password.length >= 6 && status !== 'authenticating'

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    login(email, password)
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}><Zap size={20} /></div>
          <span className={styles.logoText}>Nexus</span>
        </div>

        <h1 className={styles.heading}>Sign in to your workspace</h1>
        <p className={styles.subheading}>Project portfolio command center</p>

        <div className={styles.trustBadge}>
          <ShieldCheck size={13} />
          <span>Secured session · JWT + refresh rotation</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <div className={`${styles.inputWrap} ${touched && !emailValid ? styles.inputError : ''}`}>
              <Mail size={15} />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) clearError() }}
                onBlur={() => setTouched(true)}
              />
            </div>
            {touched && !emailValid && email.length > 0 && (
              <span className={styles.fieldError}>Enter a valid email address</span>
            )}
          </label>

          <label className={styles.field}>
            <div className={styles.linkRow} style={{ marginBottom: 0 }}>
              <span className={styles.label}>Password</span>
              <button type="button" className={styles.link} onClick={() => onNavigate('forgot')}>
                Forgot password?
              </button>
            </div>
            <div className={`${styles.inputWrap} ${touched && password.length > 0 && password.length < 6 ? styles.inputError : ''}`}>
              <Lock size={15} />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) clearError() }}
                onBlur={() => setTouched(true)}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {touched && password.length > 0 && password.length < 6 && (
              <span className={styles.fieldError}>Password must be at least 6 characters</span>
            )}
          </label>

          {error && (
            <div className={styles.authError}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
            {status === 'authenticating' ? (
              <><Loader2 size={15} className={styles.spinner} /> Signing in…</>
            ) : 'Sign In'}
          </button>
        </form>

        <p className={styles.linkRowCenter}>
          Don't have an account?
          <button type="button" className={styles.link} onClick={() => onNavigate('signup')}>
            Create one
          </button>
        </p>

        <p className={styles.footer}>
          Protected by JWT access tokens with httpOnly refresh-token rotation.
        </p>
      </div>
    </div>
  )
}
