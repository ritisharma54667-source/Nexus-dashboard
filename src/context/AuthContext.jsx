/**
 * AuthContext.jsx
 *
 * Real authentication context for Nexus Dashboard, backed by the
 * Express + PostgreSQL API in /server.
 *
 * Flow:
 * - login/signup call the API, get back { user, accessToken }, and the
 *   server also sets an httpOnly refresh cookie we never touch directly.
 * - On mount, we silently try /auth/refresh so a page reload doesn't
 *   force a re-login as long as the refresh cookie is still valid.
 * - logout clears the refresh cookie server-side and wipes local state.
 *
 * Honest gap: this demo keeps things simple by not persisting "remember
 * me" preferences or multi-device session lists — the refresh cookie is
 * the only session record, matching the tradeoff in the backend's
 * tokens.js (stateless refresh tokens, no server-side revocation list).
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api, setAccessToken } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('idle') // idle | authenticating | authenticated | error
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [bootstrapped, setBootstrapped] = useState(false) // has the silent-refresh-on-load check run yet

  // ── Silent session restore on first load ─────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.refresh() // reads httpOnly cookie
        if (cancelled) return
        setUser(data.user)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        setStatus('idle')
      } finally {
        if (!cancelled) setBootstrapped(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setStatus('authenticating')
    setError(null)
    try {
      const data = await api.login({ email, password })
      setAccessToken(data.accessToken)
      setUser(data.user)
      setStatus('authenticated')
      return true
    } catch (err) {
      setStatus('error')
      setError(err.message)
      return false
    }
  }, [])

  const signup = useCallback(async (name, email, password) => {
    setStatus('authenticating')
    setError(null)
    try {
      const data = await api.signup({ name, email, password })
      setAccessToken(data.accessToken)
      setUser(data.user)
      setStatus('authenticated')
      return true
    } catch (err) {
      setStatus('error')
      setError(err.message)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // even if the network call fails, still clear local state below
    }
    setAccessToken(null)
    setUser(null)
    setStatus('idle')
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const isSessionValid = useCallback(() => status === 'authenticated' && Boolean(user), [status, user])

  return (
    <AuthContext.Provider
      value={{ status, user, error, bootstrapped, login, signup, logout, clearError, isSessionValid }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
