import { LogOut, Shield, User, Bell, Palette, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import styles from './SettingsView.module.css'

function Row({ label, value, icon: Icon }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        {Icon && <Icon size={14} style={{ color: 'var(--text-faint)' }} />}
        <span className={styles.rowLabel}>{label}</span>
      </div>
      <span className={styles.rowValue}>{value}</span>
    </div>
  )
}

export default function SettingsView() {
  const { user, logout } = useAuth()
  const { user: profile } = useApp()

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
        <p className={styles.sub}>Account, security, and preferences</p>
      </div>

      {/* Profile */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <User size={15} style={{ color: 'var(--accent)' }} />
          <h3>Profile</h3>
        </div>
        <div className={styles.profileRow}>
          <div className={styles.avatar}>{user?.initials ?? profile.initials}</div>
          <div>
            <p className={styles.profileName}>{user?.name ?? profile.name}</p>
            <p className={styles.profileEmail}>{user?.email ?? profile.email}</p>
          </div>
          <span className={styles.roleBadge}>{(user?.role ?? profile.role)}</span>
        </div>
      </div>

      {/* Security */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Shield size={15} style={{ color: 'var(--success)' }} />
          <h3>Security & Session</h3>
        </div>
        <Row icon={Clock} label="Access token lifetime" value="15 minutes, auto-refreshed" />
        <Row label="Authentication method" value="Email + Password" />
        <Row label="Session type" value="JWT access token + httpOnly refresh cookie" />
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Notifications */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Bell size={15} style={{ color: 'var(--warning)' }} />
          <h3>Notification Preferences</h3>
        </div>
        <Row label="At-risk project alerts" value="Enabled" />
        <Row label="Budget threshold alerts" value="Enabled" />
        <Row label="Weekly digest" value="Enabled" />
      </div>

      {/* Appearance */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Palette size={15} style={{ color: 'var(--accent2)' }} />
          <h3>Appearance</h3>
        </div>
        <Row label="Theme" value="Dark (Enterprise)" />
        <Row label="Accent color" value="Blue" />
      </div>
    </div>
  )
}
