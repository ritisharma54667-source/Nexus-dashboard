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

All routes below (except `/signup`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`) require `Authorization: Bearer <accessToken>`.

### Auth — `/api/auth`

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/signup` | `{ name, email, password }` | Rate-limited. Bootstraps an organization, an owner membership, and a seed team member (see "Multi-tenancy" below). Returns `{ user, accessToken }`, sets refresh cookie. |
| POST | `/login` | `{ email, password }` | Rate-limited. Same response shape as signup. |
| POST | `/refresh` | — | Reads refresh cookie, returns a new `{ user, accessToken }`. |
| POST | `/logout` | — | Clears the refresh cookie. |
| GET  | `/me` | — | Returns `{ user }`. |
| POST | `/forgot-password` | `{ email }` | Always returns a generic success message (no account enumeration). Rate-limited. |
| POST | `/reset-password` | `{ token, password }` | `token` is the raw value from the emailed link. |

### Projects — `/api/projects`

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/` | — | Lists non-archived projects. `?includeArchived=true` to include archived. |
| GET | `/:id` | — | Single project. |
| POST | `/` | project fields (see below) | Creates a project, logs a `project_created` activity entry. |
| PATCH | `/:id` | any subset of project fields | Partial update. Logs `status_change` / `budget_update` / `project_updated` depending on what changed. |
| POST | `/:id/archive` | — | Soft-delete (status becomes `archived`, drops out of the default list). |
| POST | `/:id/unarchive` | — | Restores an archived project to `active`. |
| DELETE | `/:id` | — | Hard delete. Logs a `project_deleted` activity entry first (survives the delete via `ON DELETE SET NULL`). |

Project fields: `name` (required), `client`, `status` (`active`\|`at-risk`\|`planning`\|`on-hold`\|`completed`\|`archived`), `priority` (`low`\|`medium`\|`high`\|`critical`), `progress` (0–100), `healthScore` (0–100), `startDate`, `endDate`, `budget: { allocated, spent, currency }`, `team` (array of team-member ids), `tags` (string array), `description`, `milestones`, `risks`.

### Analytics — `GET /api/analytics`

Real aggregates computed from the live `projects` table for the requester's organization: total/active/at-risk counts, average health score, budget totals and utilization, team workload, open risk count. **Honest gap:** there's no historical snapshot table yet, so month-over-month budget trend isn't derivable from current data — the frontend's Budget Trend chart stays illustrative until that snapshot infrastructure exists.

### Activity — `GET /api/activity?limit=20`

Read-only feed over `activity_log`, written to automatically by the projects endpoints above.

### Team — `/api/team`

Lightweight people roster (`GET`, `POST`, `PATCH /:id`, `DELETE /:id`) — the people projects can be staffed with. See "Multi-tenancy" below for why this is separate from real user accounts.

`GET /api/health` is an unauthenticated liveness check.

## Multi-tenancy today — and what's next

Every signup gets its own `organization` behind the scenes (the tenancy boundary all projects/team members/activity are scoped to), and a seed `team_members` row for themselves. This is intentionally lightweight:

- **What exists now:** one owner per organization, a projects/team/activity model fully scoped by `organization_id`.
- **What doesn't exist yet:** inviting other real user accounts into your organization, roles beyond `owner`, and a UI for any of it. `organization_members` and its `role` column are already there in the schema specifically so this is additive later — no migration needed to add real multi-user support, just new endpoints (`POST /api/organizations/:id/invite`, accept-invite flow, role checks in middleware) and UI on top of the existing tables.
- **Real-time (WebSockets, live activity feed, online collaborators)** is a separate, sizeable piece of work (a socket server, presence tracking, and pushing activity_log inserts to connected clients) and isn't included here — it layers cleanly on top of the current REST API when you're ready for it.

## Testing

```bash
cp .env.test.example .env.test   # point this at a throwaway database, not your real one
npm run db:setup                 # if you haven't already applied the schema to it
npm test
```

`tests/auth.test.js` and `tests/projects.test.js` run against a real Postgres database via Supertest — no mocking of the DB layer, so they catch real SQL/schema issues. They clean up their own rows (anything with a `@nexus-test.local` email) after running. If `.env.test` doesn't exist, tests fall back to `.env` — fine for a quick local run, just don't point either at data you care about.

## Password rules

Enforced server-side (the frontend UI mirrors these for instant feedback, but the server is the source of truth): minimum 8 characters, at least one letter and one number.

## CORS

`CLIENT_ORIGIN` in `.env` controls which frontend origin is allowed to call this API with credentials. Update it if you deploy the frontend somewhere other than `localhost:5173`.
