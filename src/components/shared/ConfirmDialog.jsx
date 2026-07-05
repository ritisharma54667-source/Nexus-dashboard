import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap} style={{ color: danger ? 'var(--danger)' : 'var(--warning)' }}>
          <AlertTriangle size={18} />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={busy}>Cancel</button>
          <button
            className={danger ? styles.dangerBtn : styles.confirmBtn}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? <Loader2 size={14} className={styles.spinner} /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
