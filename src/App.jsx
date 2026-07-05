import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { useUIStore } from './store'
import { useGlobalKeyboard, useSessionExpiry, useDashboardData } from './hooks'
import { Loader2 } from 'lucide-react'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'

import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import CommandPalette from './components/shared/CommandPalette'
import NotificationPanel from './components/shared/NotificationPanel'
import ErrorBoundary from './components/shared/ErrorBoundary'

import TimelineView from './components/dashboard/TimelineView'
import WorkloadView from './components/dashboard/WorkloadView'
import BudgetView from './components/dashboard/BudgetView'
import ReportsView from './components/dashboard/ReportsView'
import SettingsView from './components/dashboard/SettingsView'

import './styles/globals.css'

// ── View router — maps activeView string to component ──────────────
function ViewRouter() {
  const activeView = useUIStore((s) => s.activeView)
  const map = {
    dashboard: <DashboardPage />,
    projects:  <ProjectsPage />,
    timeline:  <TimelineView />,
    team:      <WorkloadView />,
    budget:    <BudgetView />,
    reports:   <ReportsView />,
    settings:  <SettingsView />,
  }
  return map[activeView] ?? <DashboardPage />
}

// ── Authenticated shell ────────────────────────────────────────────
function AuthenticatedApp() {
  // Mount global hooks at the authenticated-app level
  useGlobalKeyboard()
  useSessionExpiry()
  useDashboardData()

  return (
    <AppProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
          height: '100vh',
        }}>
          <TopBar />
          <main style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
          }}>
            <ErrorBoundary>
              <ViewRouter />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <NotificationPanel />
    </AppProvider>
  )
}

// ── Unauthenticated auth flow (login / signup / forgot / reset) ────
// No react-router is mounted in this project (it's a single-page shell
// driven by Zustand's activeView), so auth screens are switched with
// simple local state instead of routes. The one exception is the
// password-reset link emailed to users, which does need to carry a
// token — we read that out of the URL once on mount.
function AuthFlow() {
  const [view, setView] = useState('login') // login | signup | forgot | reset
  const [resetToken, setResetToken] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (window.location.pathname.includes('reset-password') || token) {
      setResetToken(token)
      setView('reset')
    }
  }, [])

  const navigate = (next) => {
    // Leaving the reset-password link behind cleans up the URL bar so a
    // refresh doesn't re-trigger the reset view.
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname.split('?')[0] || '/')
    }
    setView(next)
  }

  if (view === 'signup')  return <SignupPage onNavigate={navigate} />
  if (view === 'forgot')  return <ForgotPasswordPage onNavigate={navigate} />
  if (view === 'reset')   return <ResetPasswordPage token={resetToken} onNavigate={navigate} />
  return <LoginPage onNavigate={navigate} />
}

// ── Auth gate ──────────────────────────────────────────────────────
function AppContent() {
  const { status, bootstrapped } = useAuth()

  // While we're silently checking for an existing refresh-token session
  // on first load, show a blank/loading state instead of flashing the
  // login screen for a split second.
  if (!bootstrapped) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text-faint)', gap: 10,
      }}>
        <Loader2 size={18} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} />
        Loading your workspace…
      </div>
    )
  }

  return status === 'authenticated' ? <AuthenticatedApp /> : <AuthFlow />
}

// ── Root ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
