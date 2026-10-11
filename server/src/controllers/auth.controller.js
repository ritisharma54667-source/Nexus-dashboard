/**
 * controllers/auth.controller.js
 *
 * All auth business logic. Routes are thin — they just call these.
 */

import bcrypt from 'bcryptjs'
import { query, pool } from '../db/pool.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRawResetToken,
  hashResetToken,
} from '../utils/tokens.js'
import { isValidEmail, isValidPassword, isValidName } from '../utils/validators.js'
import { sendPasswordResetEmail } from '../utils/mailer.js'

const REFRESH_COOKIE_NAME = 'nexus_refresh'
const REFRESH_TOKEN_TTL_MS = Number(process.env.REFRESH_TOKEN_TTL_MS) || 7 * 24 * 60 * 60 * 1000

// Shared cookie options for the refresh token. httpOnly means client-side
// JS (and therefore any XSS payload) can never read this cookie.
function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // 'none' lets the cookie travel between Vercel (frontend) and Render (API)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/api/auth', // only sent to auth endpoints, not the whole API
  }
}

function clearCookieOptions() {
  const { maxAge, ...rest } = refreshCookieOptions()
  return rest
}

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    initials: row.name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  }
}

// Every user belongs to exactly one organization today (see schema.sql
// notes on the multi-tenancy foundation). This looks it up for token
// issuance; signup() is what actually creates it.
async function getOrgIdForUser(userId) {
  const result = await query('SELECT organization_id FROM organization_members WHERE user_id = $1 LIMIT 1', [
    userId,
  ])
  return result.rows[0]?.organization_id ?? null
}

async function issueSession(res, userRow) {
  const user = toPublicUser(userRow)
  const orgId = await getOrgIdForUser(userRow.id)
  const accessToken = signAccessToken({ ...user, orgId })
  const refreshToken = signRefreshToken(user)
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions())
  return { user, accessToken }
}

// ── POST /api/auth/signup ──────────────────────────────────────────
export async function signup(req, res) {
  const { name, email, password } = req.body || {}

  if (!isValidName(name)) {
    return res.status(400).json({ error: 'Please enter your full name (2–80 characters).' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (!isValidPassword(password)) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 8 characters and include a letter and a number.' })
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()])
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'An account with that email already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const trimmedName = name.trim()

  // Signup bootstraps a whole tenant: the user row, their organization,
  // an ownership record, and one seed team member (themselves) so the
  // Team Workload view isn't empty on day one. All in one transaction —
  // if any step fails, none of it should stick around half-created.
  const client = await pool.connect()
  let userRow
  try {
    await client.query('BEGIN')

    const insertedUser = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'manager')
       RETURNING id, name, email, role`,
      [trimmedName, email.trim().toLowerCase(), passwordHash]
    )
    userRow = insertedUser.rows[0]

    const insertedOrg = await client.query(
      `INSERT INTO organizations (name) VALUES ($1) RETURNING id`,
      [`${trimmedName}'s Workspace`]
    )
    const orgId = insertedOrg.rows[0].id

    await client.query(
      `INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [orgId, userRow.id]
    )

    const initials = trimmedName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    await client.query(
      `INSERT INTO team_members (organization_id, name, role_title, department, initials, color, workload)
       VALUES ($1, $2, 'Owner', 'Leadership', $3, '#3A75C4', 0)`,
      [orgId, trimmedName, initials]
    )

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  const { user, accessToken } = await issueSession(res, userRow)
  res.status(201).json({ user, accessToken })
}

// ── POST /api/auth/login ───────────────────────────────────────────
export async function login(req, res) {
  const { email, password } = req.body || {}

  if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const result = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
  const userRow = result.rows[0]

  // Same generic error whether the email doesn't exist or the password is
  // wrong — don't let attackers use this endpoint to enumerate accounts.
  if (!userRow) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const passwordMatches = await bcrypt.compare(password, userRow.password_hash)
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const { user, accessToken } = await issueSession(res, userRow)
  res.json({ user, accessToken })
}

// ── POST /api/auth/refresh ─────────────────────────────────────────
// Called silently by the frontend on page load / when an access token
// expires. Reads the httpOnly cookie — no body needed.
export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!token) {
    return res.status(401).json({ error: 'No refresh token.' })
  }

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions())
    return res.status(401).json({ error: 'Refresh token invalid or expired.' })
  }

  const result = await query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub])
  const userRow = result.rows[0]
  if (!userRow) {
    res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions())
    return res.status(401).json({ error: 'User no longer exists.' })
  }

  // Rotate: issue a brand new refresh cookie + access token on every use.
  const { user, accessToken } = await issueSession(res, userRow)
  res.json({ user, accessToken })
}

// ── POST /api/auth/logout ──────────────────────────────────────────
export async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions())
  res.status(204).send()
}

// ── GET /api/auth/me ───────────────────────────────────────────────
export async function me(req, res) {
  const result = await query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.sub])
  const userRow = result.rows[0]
  if (!userRow) return res.status(404).json({ error: 'User not found.' })
  res.json({ user: toPublicUser(userRow) })
}

// ── POST /api/auth/forgot-password ─────────────────────────────────
export async function forgotPassword(req, res) {
  const { email } = req.body || {}

  // Always respond with the same generic message — whether or not the
  // email exists — so this endpoint can't be used to check who has an
  // account. The real work only happens if a user was actually found.
  const genericResponse = {
    message: 'If an account exists for that email, a reset link has been sent.',
  }

  if (!isValidEmail(email)) {
    return res.json(genericResponse)
  }

  const result = await query('SELECT id, email FROM users WHERE email = $1', [email.trim().toLowerCase()])
  const userRow = result.rows[0]

  if (userRow) {
    const rawToken = generateRawResetToken()
    const tokenHash = hashResetToken(rawToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userRow.id, tokenHash, expiresAt]
    )

    const appUrl = process.env.CLIENT_APP_URL || 'http://localhost:5173'
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`

    await sendPasswordResetEmail({ to: userRow.email, resetUrl })
  }

  res.json(genericResponse)
}

// ── POST /api/auth/reset-password ──────────────────────────────────
export async function resetPassword(req, res) {
  const { token, password } = req.body || {}

  if (typeof token !== 'string' || token.length < 10) {
    return res.status(400).json({ error: 'Missing or invalid reset token.' })
  }
  if (!isValidPassword(password)) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 8 characters and include a letter and a number.' })
  }

  const tokenHash = hashResetToken(token)

  const result = await query(
    `SELECT * FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [tokenHash]
  )
  const tokenRow = result.rows[0]

  if (!tokenRow) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, tokenRow.user_id])
  await query('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1', [tokenRow.id])

  res.json({ message: 'Password updated. You can now sign in with your new password.' })
}
