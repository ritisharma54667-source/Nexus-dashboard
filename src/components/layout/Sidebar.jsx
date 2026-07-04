import { LayoutDashboard, FolderKanban, GitBranch, Users, Wallet, BarChart3, Settings, ChevronLeft, Zap } from 'lucide-react'
import { useUIStore } from '../../store'
import styles from './Sidebar.module.css'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'projects',  label: 'Projects',   Icon: FolderKanban },
  { id: 'timeline',  label: 'Timeline',   Icon: GitBranch },
  { id: 'team',      label: 'Team',       Icon: Users },
  { id: 'budget',    label: 'Budget',     Icon: Wallet },
  { id: 'reports',   label: 'Reports',    Icon: BarChart3 },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, activeView, setView } = useUIStore()

  // Mobile shows a subset of the nav as icons along the bottom of the
  // screen instead of the full sidebar — Settings included, Reports
  // dropped to keep it to 5 items that fit comfortably on a phone.
  const MOBILE_NAV = [...NAV.slice(0, 4), { id: 'settings', label: 'Settings', Icon: Settings }]

  return (
    <>
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Zap size={18} /></div>
          {sidebarOpen && <span className={styles.logoText}>Nexus</span>}
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${activeView === id ? styles.active : ''}`}
              onClick={() => setView(id)}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
              {activeView === id && <div className={styles.activePip} />}
            </button>
          ))}
        </nav>

        <div className={styles.bottom}>
          <button
            className={`${styles.navItem} ${activeView === 'settings' ? styles.active : ''}`}
            onClick={() => setView('settings')}
            title={!sidebarOpen ? 'Settings' : undefined}
          >
            <Settings size={18} />
            {sidebarOpen && <span>Settings</span>}
          </button>
          <button className={styles.collapseBtn} onClick={toggleSidebar} title="Toggle sidebar">
            <ChevronLeft size={16} className={!sidebarOpen ? styles.rotated : ''} />
          </button>
        </div>
      </aside>

      {/* Mobile-only bottom tab bar — hidden on desktop via media query */}
      <nav className={styles.mobileNav}>
        {MOBILE_NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`${styles.mobileNavItem} ${activeView === id ? styles.active : ''}`}
            onClick={() => setView(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
