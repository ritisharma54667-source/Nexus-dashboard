import { AlertTriangle, CheckCircle2, Info, X, Bell } from 'lucide-react'
import { useNotifStore, useProjectStore, useUIStore } from '../../store'
import { relativeDate } from '../../utils'
import styles from './NotificationPanel.module.css'

const TYPE_META = {
  danger:  { icon: AlertTriangle, color: 'var(--danger)' },
  warning: { icon: AlertTriangle, color: 'var(--warning)' },
  success: { icon: CheckCircle2,  color: 'var(--success)' },
  info:    { icon: Info,          color: 'var(--accent)' },
}

export default function NotificationPanel() {
  const { panelOpen, togglePanel, notifications, markRead, markAllRead } = useNotifStore()
  const { selectProject } = useProjectStore()
  const { setView } = useUIStore()

  if (!panelOpen) return null

  const handleClick = (n) => {
    markRead(n.id)
    if (n.projectId) {
      setView('projects')
      selectProject(n.projectId)
    }
    togglePanel()
  }

  return (
    <>
      <div className={styles.overlay} onClick={togglePanel} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}><Bell size={15} /> Notifications</h3>
          <div className={styles.headerActions}>
            <button className={styles.markAll} onClick={markAllRead}>Mark all read</button>
            <button className={styles.closeBtn} onClick={togglePanel}><X size={16} /></button>
          </div>
        </div>

        <div className={styles.list}>
          {notifications.length === 0 && (
            <div className={styles.empty}>
              <Bell size={28} style={{ color: 'var(--text-faint)' }} />
              <p>You're all caught up</p>
            </div>
          )}
          {notifications.map((n) => {
            const { icon: Icon, color } = TYPE_META[n.type] ?? TYPE_META.info
            return (
              <button
                key={n.id}
                className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                onClick={() => handleClick(n)}
              >
                <div className={styles.itemIcon} style={{ background: `${color}20`, color }}>
                  <Icon size={14} />
                </div>
                <div className={styles.itemContent}>
                  <p className={styles.itemTitle}>{n.title}</p>
                  <p className={styles.itemMsg}>{n.message}</p>
                  <p className={styles.itemTime}>{relativeDate(n.createdAt)}</p>
                </div>
                {!n.read && <span className={styles.dot} />}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
