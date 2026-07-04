/**
 * utils/validators.js
 * Small dependency-free validation helpers for auth input.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim())
}

// Mirrors the frontend rule (min 6 chars) but also asks for at least
// one letter and one number, since this is the boundary that actually
// enforces password quality — the frontend check is just UX.
export function isValidPassword(password) {
  if (typeof password !== 'string' || password.length < 8) return false
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasLetter && hasNumber
}

export function isValidName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 80
}
