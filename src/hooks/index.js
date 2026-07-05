/**
 * hooks/index.js — Custom hooks for Nexus Dashboard.
 * Each hook has one job. No business logic in components.
 */

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUIStore, useProjectStore, useActivityStore, useTeamStore } from '../store'
import { api } from '../utils/api'

/**
 * useGlobalKeyboard
 * App-wide keyboard shortcuts. Mount once at the root.
 */
export function useGlobalKeyboard() {
  const openCommandPalette  = useUIStore((s) => s.openCommandPalette)
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette)
  const commandPaletteOpen  = useUIStore((s) => s.commandPaletteOpen)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        commandPaletteOpen ? closeCommandPalette() : openCommandPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, openCommandPalette, closeCommandPalette])
}

/**
 * useSessionExpiry
 *
 * Periodically pings the API's silent-refresh endpoint so a long-open
 * tab keeps its access token fresh in the background, and logs the user
 * out if the refresh cookie has actually expired or been revoked
 * server-side (e.g. after 7 days, or a password reset elsewhere).
 */
export function useSessionExpiry() {
  const { logout, status } = useAuth()

  useEffect(() => {
    if (status !== 'authenticated') return
    const interval = setInterval(async () => {
      try {
        await api.refresh()
      } catch {
        logout()
      }
    }, 10 * 60_000) // every 10 minutes — comfortably inside the 15 min access-token TTL
    return () => clearInterval(interval)
  }, [status, logout])
}

/**
 * useOutsideClick — calls handler when click is outside ref.
 */
export function useOutsideClick(ref, handler) {
  useEffect(() => {
    const fn = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler(e)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ref, handler])
}

/**
 * useDebounce — debounce a rapidly-changing value.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * useDashboardData
 *
 * Loads projects, team roster, and activity from the live API once the
 * user is authenticated, and populates the corresponding Zustand
 * stores. Mount once near the root of the authenticated app.
 */
export function useDashboardData() {
  const { status } = useAuth()
  const setProjects = useProjectStore((s) => s.setProjects)
  const setMembers  = useTeamStore((s) => s.setMembers)
  const setActivity = useActivityStore((s) => s.setActivity)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      const [projectsRes, teamRes, activityRes] = await Promise.all([
        api.projects.list(),
        api.team.list(),
        api.activity.list(30),
      ])
      setProjects(projectsRes.projects)
      setMembers(teamRes.team)
      setActivity(activityRes.activity)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [setProjects, setMembers, setActivity])

  useEffect(() => {
    if (status === 'authenticated') reload()
  }, [status, reload])

  return { reload, error }
}

/**
 * useProjectActions
 *
 * Wraps the projects API so components don't need to juggle the store
 * update themselves — every action hits the API first, then syncs the
 * store from the (authoritative) response.
 */
export function useProjectActions() {
  const addProject       = useProjectStore((s) => s.addProject)
  const replaceProject   = useProjectStore((s) => s.replaceProject)
  const removeProjectLocal = useProjectStore((s) => s.removeProjectLocal)
  const setActivity       = useActivityStore((s) => s.setActivity)

  const refreshActivity = useCallback(async () => {
    try {
      const res = await api.activity.list(30)
      setActivity(res.activity)
    } catch {
      // non-critical — the activity feed will just be a beat behind
    }
  }, [setActivity])

  const createProject = useCallback(async (input) => {
    const { project } = await api.projects.create(input)
    addProject(project)
    refreshActivity()
    return project
  }, [addProject, refreshActivity])

  const updateProject = useCallback(async (id, input) => {
    const { project } = await api.projects.update(id, input)
    replaceProject(id, project)
    refreshActivity()
    return project
  }, [replaceProject, refreshActivity])

  const archiveProject = useCallback(async (id) => {
    const { project } = await api.projects.archive(id)
    replaceProject(id, project)
    refreshActivity()
    return project
  }, [replaceProject, refreshActivity])

  const unarchiveProject = useCallback(async (id) => {
    const { project } = await api.projects.unarchive(id)
    replaceProject(id, project)
    refreshActivity()
    return project
  }, [replaceProject, refreshActivity])

  const deleteProject = useCallback(async (id) => {
    await api.projects.remove(id)
    removeProjectLocal(id)
    refreshActivity()
  }, [removeProjectLocal, refreshActivity])

  return { createProject, updateProject, archiveProject, unarchiveProject, deleteProject }
}
