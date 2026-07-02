import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { useUIStore } from './store'
import { useGlobalKeyboard, useSessionExpiry } from './hooks'

import LoginPage from './pages/LoginPage'
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

// ── Auth gate ──────────────────────────────────────────────────────
function AppContent() {
  const { status, isSessionValid } = useAuth()
  const authed = status === 'authenticated' && isSessionValid()
  return authed ? <AuthenticatedApp /> : <LoginPage />
}

// ── Root ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
