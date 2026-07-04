/**
 * middleware/auth.js
 * Protects routes by requiring a valid access token in the
 * Authorization header: "Authorization: Bearer <token>"
 */

import { verifyAccessToken } from '../utils/tokens.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  try {
    req.user = verifyAccessToken(token) // { sub, email, role, name, iat, exp }
    next()
  } catch (err) {
    // Distinguish expiry from other failures so the frontend knows to
    // try a silent refresh instead of bouncing straight to the login page.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired.', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid access token.' })
  }
}
