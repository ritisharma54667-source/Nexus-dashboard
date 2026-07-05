-- ─────────────────────────────────────────────────────────────
-- Nexus Dashboard — schema.sql
-- Run automatically by `npm run db:setup`, or paste into psql yourself.
-- ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gives us gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;   -- gives us case-insensitive email column

-- ── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         CITEXT UNIQUE NOT NULL,   -- case-insensitive email match
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'manager',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Password reset tokens ──────────────────────────────────
-- We never store the raw token — only a SHA-256 hash of it — so a DB
-- leak alone can't be used to reset anyone's password.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Keep updated_at fresh on every row update (used by users + projects)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Organizations (lightweight multi-tenancy foundation) ───────
-- Every user gets one organization created at signup. This is the
-- tenancy boundary all projects/team members/activity are scoped to.
-- Full multi-user support (inviting other real accounts into the same
-- organization, roles beyond 'owner') is intentionally not built yet —
-- see server/README.md for the phased plan.
CREATE TABLE IF NOT EXISTS organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'owner', -- owner | admin | member (only 'owner' is issued today)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- ── Team members ────────────────────────────────────────────────
-- A lightweight people roster used for workload/assignment display.
-- Distinct from organization_members: these don't log in, they're just
-- the people a project can be staffed with (matches the existing
-- Team Workload view). Real invited-user accounts are a future phase.
CREATE TABLE IF NOT EXISTS team_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  role_title      TEXT NOT NULL DEFAULT 'Team Member',
  department      TEXT NOT NULL DEFAULT 'General',
  initials        TEXT NOT NULL,
  color           TEXT NOT NULL DEFAULT '#3A75C4',
  workload        INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_members_org ON team_members(organization_id);

-- ── Projects ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  client            TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'planning', -- active | at-risk | planning | on-hold | completed | archived
  priority          TEXT NOT NULL DEFAULT 'medium',   -- low | medium | high | critical
  progress          INT NOT NULL DEFAULT 0,
  health_score      INT NOT NULL DEFAULT 100,
  priority_score    INT NOT NULL DEFAULT 50,
  start_date        DATE,
  end_date          DATE,
  budget_allocated  NUMERIC(14,2) NOT NULL DEFAULT 0,
  budget_spent      NUMERIC(14,2) NOT NULL DEFAULT 0,
  budget_currency   TEXT NOT NULL DEFAULT '₹',
  owner_id          UUID REFERENCES team_members(id) ON DELETE SET NULL,
  team_member_ids   UUID[] NOT NULL DEFAULT '{}',
  tags              TEXT[] NOT NULL DEFAULT '{}',
  description       TEXT NOT NULL DEFAULT '',
  milestones        JSONB NOT NULL DEFAULT '[]', -- [{id,title,dueDate,status,completedAt}]
  risks             JSONB NOT NULL DEFAULT '[]', -- [{id,title,severity,likelihood,status,owner}]
  archived_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(organization_id, status);

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Activity log ────────────────────────────────────────────────
-- Populated automatically by the projects API on create/update/
-- archive/delete — powers the live Activity Stream / Insights feed.
CREATE TABLE IF NOT EXISTS activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  actor_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  type            TEXT NOT NULL, -- project_created | status_change | milestone_complete | risk_added | budget_update | project_archived | project_deleted
  message         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_log(organization_id, created_at DESC);

