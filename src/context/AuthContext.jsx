/**
 * AuthContext.jsx
 *
 * Authentication context for Nexus Dashboard.
 *
 * IMPORTANT — Portfolio/demo scope:
 * This simulates a production-grade auth flow (session tokens, expiry,
 * route protection) entirely in-memory for demo purposes. In a real
 * deployment this would call a backend issuing httpOnly JWT cookies
 * with refresh-token rotation — never store real tokens in localStorage.
 *
 * What this demonstrates to reviewers:
 * - Proper auth state machine (idle/authenticating/authenticated/error)
 * - Session expiry handling
 * - Route protection pattern
 * - Input validation before submission
 */

import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 'u1',
  name: 'Pratik Sharma',
  email: 'pratik@nexus.io',
  role: 'manager',
  initials: 'PS',
}

// Simulated credential check — in production this hits a backend
// with bcrypt/argon2 password hashing and rate limiting.
const DEMO_CREDENTIALS = { email: 'demo@nexus.io', password: 'nexus2025' }

function generateSessionToken() {
  // Simulated opaque session token (real impl: signed JWT from server)
  return `nx_sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('idle') // idle | authenticating | authenticated | error
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null) // { token, expiresAt }
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setStatus('authenticating')
    setError(null)

    // Simulated network latency for realism
    await new Promise((r) => setTimeout(r, 700))

    if (!email || !password) {
      setStatus('error')
      setError('Email and password are required.')
      return false
    }

    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      setStatus('error')
      setError('Invalid email or password.')
      return false
    }

    const token = generateSessionToken()
    const expiresAt = Date.now() + 1000 * 60 * 60 * 8 // 8 hour session

    setSession({ token, expiresAt })
    setUser(DEMO_USER)
    setStatus('authenticated')
    return true
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    setUser(null)
    setStatus('idle')
    setError(null)
  }, [])

  const isSessionValid = useCallback(() => {
    if (!session) return false
    return Date.now() < session.expiresAt
  }, [session])

  return (
    <AuthContext.Provider value={{ status, user, session, error, login, logout, isSessionValid }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
