import { useState } from 'react'
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './AuthLayout.module.css'

function passwordChecks(pw) {
  return {
    length: pw.length >= 8,
    letter: /[A-Za-z]/.test(pw),
    number: /[0-9]/.test(pw),
  }
}

export default function SignupPage({ onNavigate }) {
  const { signup, status, error, clearError } = useAuth()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [touched, setTouched]   = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const nameValid  = name.trim().length >= 2
  const pwChecks   = passwordChecks(password)
  const pwValid    = pwChecks.length && pwChecks.letter && pwChecks.number
  const canSubmit  = nameValid && emailValid && pwValid && status !== 'authenticating'

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    signup(name.trim(), email, password)
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}><Zap size={20} /></div>
          <span className={styles.logoText}>Nexus</span>
        </div>

        <h1 className={styles.heading}>Create your workspace</h1>
        <p className={styles.subheading}>Set up your project portfolio command center</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Full name</span>
            <div className={`${styles.inputWrap} ${touched && !nameValid ? styles.inputError : ''}`}>
              <User size={15} />
              <input
                type="text"
                autoComplete="name"
                placeholder="Pratik Tomar"
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) clearError() }}
                onBlur={() => setTouched(true)}
              />
            </div>
          </label>

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
            <span className={styles.label}>Password</span>
            <div className={`${styles.inputWrap} ${touched && password.length > 0 && !pwValid ? styles.inputError : ''}`}>
              <Lock size={15} />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) clearError() }}
                onBlur={() => setTouched(true)}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password.length > 0 && (
              <span className={styles.hint}>
                {pwChecks.length ? '✓' : '·'} 8+ characters &nbsp; {pwChecks.letter ? '✓' : '·'} a letter &nbsp; {pwChecks.number ? '✓' : '·'} a number
              </span>
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
              <><Loader2 size={15} className={styles.spinner} /> Creating account…</>
            ) : (
              <><CheckCircle2 size={15} /> Create account</>
            )}
          </button>
        </form>

        <p className={styles.linkRowCenter}>
          Already have an account?
          <button type="button" className={styles.link} onClick={() => onNavigate('login')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
