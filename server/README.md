# Nexus Dashboard — API

Express + PostgreSQL backend providing authentication for the Nexus frontend: signup, login, JWT access tokens, httpOnly refresh-token rotation, forgot password (emailed link), and reset password.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — a Postgres connection string. Works with a local install or a hosted provider like [Neon](https://neon.tech) (free tier).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — two different long random strings. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- Leave the `SMTP_*` fields blank for local dev — reset-password emails will print to your terminal instead of actually sending.

Then create the tables and start the server:

```bash
npm run db:setup   # applies server/src/db/schema.sql — safe to re-run
npm run dev         # http://localhost:4000, restarts on file change
```

## Auth model

- **Access token** — short-lived JWT (15 min default), sent back in the JSON response body and expected in `Authorization: Bearer <token>` on protected requests. The frontend keeps this in memory only.
- **Refresh token** — longer-lived JWT (7 days default), set as an `httpOnly`, `SameSite=Lax` cookie scoped to `/api/auth`. Client-side JS never sees it. `POST /api/auth/refresh` reads it and issues a new access token (and rotates the refresh cookie).
- **Passwords** — hashed with bcrypt (12 rounds). Never logged, never returned in any response.
- **Password reset tokens** — a random 32-byte token is emailed to the user; only its SHA-256 hash is stored in the DB, with a 1-hour expiry and single-use enforcement.

**Known simplification:** refresh tokens are verified by signature only — there's no server-side revocation list. Logging out clears the cookie, but a copied, still-valid refresh token would keep working until it naturally expires. A production system would additionally store issued refresh tokens (or a denylist) in the DB or Redis so individual sessions can be revoked on demand.

## Endpoints

All routes are prefixed with `/api/auth`.

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/signup` | `{ name, email, password }` | Rate-limited. Returns `{ user, accessToken }`, sets refresh cookie. |
| POST | `/login` | `{ email, password }` | Rate-limited. Same response shape as signup. |
| POST | `/refresh` | — | Reads refresh cookie, returns a new `{ user, accessToken }`. |
| POST | `/logout` | — | Clears the refresh cookie. |
| GET  | `/me` | — | Requires `Authorization: Bearer <accessToken>`. Returns `{ user }`. |
| POST | `/forgot-password` | `{ email }` | Always returns a generic success message (no account enumeration). Rate-limited. |
| POST | `/reset-password` | `{ token, password }` | `token` is the raw value from the emailed link. |

`GET /api/health` is an unauthenticated liveness check.

## Password rules

Enforced server-side (the frontend UI mirrors these for instant feedback, but the server is the source of truth): minimum 8 characters, at least one letter and one number.

## CORS

`CLIENT_ORIGIN` in `.env` controls which frontend origin is allowed to call this API with credentials. Update it if you deploy the frontend somewhere other than `localhost:5173`.
