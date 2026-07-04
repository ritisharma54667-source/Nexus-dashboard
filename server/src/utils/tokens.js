/**
 * utils/tokens.js
 *
 * All JWT signing/verification and password-reset-token hashing lives
 * here so the rest of the app never touches `jsonwebtoken` or `crypto`
 * directly.
 *
 * Auth model:
 * - Access token:  short-lived JWT, sent in the Authorization header,
 *                  kept in memory on the frontend (never localStorage).
 * - Refresh token: longer-lived JWT, sent as an httpOnly cookie so
 *                  client-side JS can never read it. Used only to mint
 *                  new access tokens via POST /api/auth/refresh.
 *
 * Honest gap: refresh tokens here are stateless (verified by signature
 * only). There's no server-side revocation list, so a logout clears the
 * cookie but a still-valid stolen refresh token would keep working until
 * it expires. A production system would track refresh tokens in the DB
 * (or a Redis denylist) so they can be revoked individually.
 */

import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_TTL = '15m',
  REFRESH_TOKEN_TTL = '7d',
} = process.env

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  console.error('✖ JWT_ACCESS_SECRET / JWT_REFRESH_SECRET missing from server/.env')
  process.exit(1)
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  )
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, tokenType: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET)
}

// ── Password reset tokens ─────────────────────────────────────────
// The raw token goes in the emailed link; only its SHA-256 hash is
// stored in the DB, so a database leak can't be used to reset passwords.

export function generateRawResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}
