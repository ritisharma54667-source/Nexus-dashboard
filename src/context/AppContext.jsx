/**
 * AppContext.jsx
 *
 * Runtime application context. Provides app-wide config, current user,
 * and role-based permission helpers to the entire component tree.
 *
 * See PROJECT_CONTEXT.md for the full product philosophy and data model.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
}

// Used only as a fallback shape before the real authenticated user loads.
const FALLBACK_USER = {
  id: '',
  name: 'Loading…',
  role: ROLES.MANAGER,
  avatar: null,
  initials: '··',
  department: 'Engineering',
  email: '',
}

const PERMISSIONS = {
  [ROLES.ADMIN]:   { canEdit: true,  canDelete: true,  canViewBudget: true,  canManageTeam: true },
  [ROLES.MANAGER]: { canEdit: true,  canDelete: false, canViewBudget: true,  canManageTeam: true },
  [ROLES.MEMBER]:  { canEdit: false, canDelete: false, canViewBudget: false, canManageTeam: false },
}

export function AppProvider({ children }) {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState(() => ({ ...FALLBACK_USER, ...authUser, department: 'Engineering' }))
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // AppProvider only mounts once the user is authenticated (see App.jsx),
  // but keep this in sync in case the profile is refreshed mid-session.
  useEffect(() => {
    if (authUser) {
      setUser((prev) => ({ ...prev, ...authUser }))
    }
  }, [authUser])

  const can = (action) => PERMISSIONS[user.role]?.[action] ?? false

  return (
    <AppContext.Provider value={{ user, setUser, can, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
