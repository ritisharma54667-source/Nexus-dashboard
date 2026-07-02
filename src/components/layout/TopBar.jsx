import { Search, Bell, Command, CalendarDays } from 'lucide-react'
import { useUIStore, useNotifStore } from '../../store'
import { useApp } from '../../context/AppContext'
import { format } from 'date-fns'
import styles from './TopBar.module.css'

export default function TopBar() {
  const { openCommandPalette, activeView } = useUIStore()
  const { togglePanel } = useNotifStore()
  const unread = useNotifStore((s) => s.getUnreadCount())
  const { user } = useApp()

  const VIEW_LABELS = {
    dashboard: 'Dashboard',
    projects:  'All Projects',
    timeline:  'Timeline',
    team:      'Team Workload',
    budget:    'Budget Analysis',
    reports:   'Reports',
    settings:  'Settings',
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.viewTitle}>{VIEW_LABELS[activeView] ?? 'Dashboard'}</h1>
        <div className={styles.date}>
          <CalendarDays size={13} />
          <span>{format(new Date(), 'EEE, MMM d yyyy')}</span>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.searchBtn} onClick={openCommandPalette}>
          <Search size={14} />
          <span>Search or jump to…</span>
          <kbd><Command size={10} />K</kbd>
        </button>

        <button className={styles.iconBtn} onClick={togglePanel} title="Notifications">
          <Bell size={17} />
          {unread > 0 && <span className={styles.badge}>{unread}</span>}
        </button>

        <div className={styles.avatar} title={user.name}>
          {user.initials}
        </div>
      </div>
    </header>
  )
}
