import { useState } from 'react'
import { Zap, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login, status, error } = useAuth()
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
          <span>Secured session · 256-bit encrypted</span>
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
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
              />
            </div>
            {touched && !emailValid && email.length > 0 && (
              <span className={styles.fieldError}>Enter a valid email address</span>
            )}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <div className={`${styles.inputWrap} ${touched && password.length > 0 && password.length < 6 ? styles.inputError : ''}`}>
              <Lock size={15} />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <><Loader2 size={15} className={styles.spinner} /> Verifying…</>
            ) : 'Sign In'}
          </button>
        </form>

        <div className={styles.demoBox}>
          <p className={styles.demoTitle}>Demo credentials</p>
          <p className={styles.demoCreds}>demo@nexus.io · nexus2025</p>
        </div>

        <p className={styles.footer}>
          Protected by session-based authentication with automatic 8-hour expiry.
        </p>
      </div>
    </div>
  )
}
