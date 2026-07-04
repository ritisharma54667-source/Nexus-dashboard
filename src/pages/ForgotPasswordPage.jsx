import { useState } from 'react'
import { Zap, Mail, ArrowLeft, AlertCircle, Loader2, MailCheck } from 'lucide-react'
import { api } from '../utils/api'
import styles from './AuthLayout.module.css'

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail]     = useState('')
  const [touched, setTouched] = useState(false)
  const [status, setStatus]   = useState('idle') // idle | sending | sent | error
  const [error, setError]     = useState(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit   = emailValid && status !== 'sending'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    setStatus('sending')
    setError(null)
    try {
      await api.forgotPassword({ email })
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <button type="button" className={styles.backLink} onClick={() => onNavigate('login')}>
          <ArrowLeft size={13} /> Back to sign in
        </button>

        <div className={styles.brand}>
          <div className={styles.logoIcon}><Zap size={20} /></div>
          <span className={styles.logoText}>Nexus</span>
        </div>

        <h1 className={styles.heading}>Reset your password</h1>
        <p className={styles.subheading}>
          {status === 'sent'
            ? 'Check your inbox for the reset link.'
            : "Enter your email and we'll send you a link to reset it."}
        </p>

        {status === 'sent' ? (
          <div className={styles.successBox}>
            <MailCheck size={16} />
            <span>
              If an account exists for <strong>{email}</strong>, a password reset link is on its way.
              It expires in 1 hour.
            </span>
          </div>
        ) : (
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
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null) }}
                  onBlur={() => setTouched(true)}
                  autoFocus
                />
              </div>
              {touched && !emailValid && email.length > 0 && (
                <span className={styles.fieldError}>Enter a valid email address</span>
              )}
            </label>

            {error && (
              <div className={styles.authError}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
              {status === 'sending' ? (
                <><Loader2 size={15} className={styles.spinner} /> Sending link…</>
              ) : 'Send reset link'}
            </button>
          </form>
        )}

        <p className={styles.linkRowCenter}>
          Remembered it?
          <button type="button" className={styles.link} onClick={() => onNavigate('login')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
