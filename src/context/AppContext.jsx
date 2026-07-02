/**
 * AppContext.jsx
 *
 * Runtime application context. Provides app-wide config, current user,
 * and role-based permission helpers to the entire component tree.
 *
 * See PROJECT_CONTEXT.md for the full product philosophy and data model.
 */

import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
}

const CURRENT_USER = {
  id: 'u1',
  name: 'Pratik Sharma',
  role: ROLES.MANAGER,
  avatar: null,
  initials: 'PS',
  department: 'Engineering',
  email: 'pratik@nexus.io',
}

const PERMISSIONS = {
  [ROLES.ADMIN]:   { canEdit: true,  canDelete: true,  canViewBudget: true,  canManageTeam: true },
  [ROLES.MANAGER]: { canEdit: true,  canDelete: false, canViewBudget: true,  canManageTeam: true },
  [ROLES.MEMBER]:  { canEdit: false, canDelete: false, canViewBudget: false, canManageTeam: false },
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(CURRENT_USER)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
