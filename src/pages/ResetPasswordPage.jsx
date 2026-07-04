import { useState } from 'react'
import { Zap, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { api } from '../utils/api'
import styles from './AuthLayout.module.css'

function passwordChecks(pw) {
  return {
    length: pw.length >= 8,
    letter: /[A-Za-z]/.test(pw),
    number: /[0-9]/.test(pw),
  }
}

// `token` comes from the ?token= query param on the /reset-password link
// that was emailed to the user (see App.jsx for how it's parsed out of
// the URL on load).
export default function ResetPasswordPage({ token, onNavigate }) {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [touched, setTouched]     = useState(false)
  const [status, setStatus]       = useState('idle') // idle | saving | done | error
  const [error, setError]         = useState(null)

  const pwChecks   = passwordChecks(password)
  const pwValid    = pwChecks.length && pwChecks.letter && pwChecks.number
  const matchValid = confirm.length > 0 && confirm === password
  const canSubmit  = pwValid && matchValid && status !== 'saving' && Boolean(token)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    setStatus('saving')
    setError(null)
    try {
      await api.resetPassword({ token, password })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGlow} />
        <div className={styles.card}>
          <div className={styles.authError}>
            <AlertCircle size={14} />
            <span>This reset link is missing its token. Request a new one from the sign-in page.</span>
          </div>
          <p className={styles.linkRowCenter} style={{ marginTop: 16 }}>
            <button type="button" className={styles.link} onClick={() => onNavigate('forgot')}>
              Request a new link
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        {status !== 'done' && (
          <button type="button" className={styles.backLink} onClick={() => onNavigate('login')}>
            <ArrowLeft size={13} /> Back to sign in
          </button>
        )}

        <div className={styles.brand}>
          <div className={styles.logoIcon}><Zap size={20} /></div>
          <span className={styles.logoText}>Nexus</span>
        </div>

        {status === 'done' ? (
          <>
            <h1 className={styles.heading}>Password updated</h1>
            <div className={styles.successBox} style={{ marginTop: 12 }}>
              <CheckCircle2 size={16} />
              <span>Your password has been changed. You can now sign in with your new password.</span>
            </div>
            <button type="button" className={styles.submitBtn} style={{ marginTop: 18 }} onClick={() => onNavigate('login')}>
              Go to sign in
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.heading}>Set a new password</h1>
            <p className={styles.subheading}>Choose something you haven't used before.</p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <label className={styles.field}>
                <span className={styles.label}>New password</span>
                <div className={`${styles.inputWrap} ${touched && password.length > 0 && !pwValid ? styles.inputError : ''}`}>
                  <Lock size={15} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(null) }}
                    onBlur={() => setTouched(true)}
                    autoFocus
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

              <label className={styles.field}>
                <span className={styles.label}>Confirm password</span>
                <div className={`${styles.inputWrap} ${touched && confirm.length > 0 && !matchValid ? styles.inputError : ''}`}>
                  <Lock size={15} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); if (error) setError(null) }}
                    onBlur={() => setTouched(true)}
                  />
                </div>
                {touched && confirm.length > 0 && !matchValid && (
                  <span className={styles.fieldError}>Passwords don't match</span>
                )}
              </label>

              {error && (
                <div className={styles.authError}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
                {status === 'saving' ? (
                  <><Loader2 size={15} className={styles.spinner} /> Updating…</>
                ) : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
