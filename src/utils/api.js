/**
 * utils/api.js
 *
 * Thin fetch wrapper for talking to the Nexus backend.
 *
 * Auth model on this side:
 * - The access token lives only in memory (set via setAccessToken from
 *   AuthContext) — never in localStorage/sessionStorage, so it can't be
 *   read by an XSS payload or survive a hard refresh.
 * - The refresh token is an httpOnly cookie the browser sends
 *   automatically (`credentials: 'include'`) — JS never touches it.
 * - If a request comes back 401 with code TOKEN_EXPIRED, we transparently
 *   call /auth/refresh once and retry the original request. If that also
 *   fails, we give up and let the caller (AuthContext) log the user out.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

let accessToken = null
let refreshInFlight = null // dedupe concurrent refresh calls

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

async function rawRequest(path, { method = 'GET', body, skipAuthHeader = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include', // send/receive the httpOnly refresh cookie
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && !skipAuthHeader ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  let data = null
  try {
    data = res.status === 204 ? null : await res.json()
  } catch {
    data = null
  }

  return { res, data }
}

async function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = rawRequest('/auth/refresh', { method: 'POST' })
      .then(({ res, data }) => {
        if (!res.ok) throw new Error(data?.error || 'Session expired.')
        setAccessToken(data.accessToken)
        return data
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

/**
 * Main entry point for all API calls.
 * Throws an Error with a user-friendly `.message` on failure.
 */
export async function apiRequest(path, options = {}) {
  let { res, data } = await rawRequest(path, options)

  if (res.status === 401 && data?.code === 'TOKEN_EXPIRED') {
    try {
      await refreshAccessToken()
      ;({ res, data } = await rawRequest(path, options))
    } catch {
      // fall through — the caller will see the original 401
    }
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status}).`
    throw new Error(message)
  }

  return data
}

export const api = {
  signup: (body) => apiRequest('/auth/signup', { method: 'POST', body }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/auth/me'),
  refresh: () => refreshAccessToken(),
  forgotPassword: (body) => apiRequest('/auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => apiRequest('/auth/reset-password', { method: 'POST', body }),

  projects: {
    list: (opts = {}) => apiRequest(`/projects${opts.includeArchived ? '?includeArchived=true' : ''}`),
    get: (id) => apiRequest(`/projects/${id}`),
    create: (body) => apiRequest('/projects', { method: 'POST', body }),
    update: (id, body) => apiRequest(`/projects/${id}`, { method: 'PATCH', body }),
    archive: (id) => apiRequest(`/projects/${id}/archive`, { method: 'POST' }),
    unarchive: (id) => apiRequest(`/projects/${id}/unarchive`, { method: 'POST' }),
    remove: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
  },

  analytics: {
    get: () => apiRequest('/analytics'),
  },

  activity: {
    list: (limit = 20) => apiRequest(`/activity?limit=${limit}`),
  },

  team: {
    list: () => apiRequest('/team'),
    create: (body) => apiRequest('/team', { method: 'POST', body }),
    update: (id, body) => apiRequest(`/team/${id}`, { method: 'PATCH', body }),
    remove: (id) => apiRequest(`/team/${id}`, { method: 'DELETE' }),
  },
}
