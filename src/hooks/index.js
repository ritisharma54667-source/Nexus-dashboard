/**
 * hooks/index.js — Custom hooks for Nexus Dashboard.
 * Each hook has one job. No business logic in components.
 */

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUIStore } from '../store'
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
