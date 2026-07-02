/**
 * stores/index.js
 *
 * Zustand stores for Nexus Dashboard.
 * Rules:
 * - Stores are flat. Max 2 levels of nesting.
 * - No derived data in stores — use selectors/hooks.
 * - Actions are co-located with state.
 */

import { create } from 'zustand'
import { PROJECTS, NOTIFICATIONS, TEAM_MEMBERS } from '../data/mockData'

// ─── Project Store ──────────────────────────────────────────────────
export const useProjectStore = create((set, get) => ({
  projects: PROJECTS,
  selectedProjectId: null,
  filters: {
    status: 'all',
    priority: 'all',
    search: '',
    smart: null, // 'late' | 'over-budget' | 'needs-review'
  },
  sortBy: 'priorityScore',
  sortDir: 'desc',

  selectProject: (id) => set({ selectedProjectId: id }),
  clearSelection: () => set({ selectedProjectId: null }),

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  setSort: (field) =>
    set((s) => ({
      sortBy: field,
      sortDir: s.sortBy === field && s.sortDir === 'desc' ? 'asc' : 'desc',
    })),

  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  getFilteredProjects: () => {
    const { projects, filters, sortBy, sortDir } = get()
    let result = [...projects]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q)
      )
    }
    if (filters.status !== 'all') result = result.filter((p) => p.status === filters.status)
    if (filters.priority !== 'all') result = result.filter((p) => p.priority === filters.priority)
    if (filters.smart === 'late') result = result.filter((p) => p.status === 'at-risk' || p.healthScore < 60)
    if (filters.smart === 'over-budget') result = result.filter((p) => p.budget.spent > p.budget.allocated * 0.9)
    if (filters.smart === 'needs-review') result = result.filter((p) => p.risks.some((r) => r.status === 'open'))

    result.sort((a, b) => {
      const av = a[sortBy] ?? 0
      const bv = b[sortBy] ?? 0
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })

    return result
  },
}))

// ─── UI Store ────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  activeModal: null,    // null | 'add-project' | 'confirm-delete'
  activeView: 'dashboard', // dashboard | projects | timeline | team | budget

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  setView: (view) => set({ activeView: view }),
}))

// ─── Notification Store ───────────────────────────────────────────────
export const useNotifStore = create((set, get) => ({
  notifications: NOTIFICATIONS,
  panelOpen: false,

  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
}))

// ─── Team Store ───────────────────────────────────────────────────────
export const useTeamStore = create(() => ({
  members: TEAM_MEMBERS,
}))
