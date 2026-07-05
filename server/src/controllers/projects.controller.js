/**
 * controllers/projects.controller.js
 *
 * Full CRUD for projects, scoped to the requesting user's organization
 * (req.user.orgId, set by the JWT — see middleware/auth.js). Every
 * mutating action writes a row to activity_log so the Activity Stream
 * and Insights panel reflect real changes instead of mock data.
 */

import { query } from '../db/pool.js'

const VALID_STATUSES = ['active', 'at-risk', 'planning', 'on-hold', 'completed', 'archived']
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical']

function serializeProject(row) {
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    status: row.status,
    priority: row.priority,
    progress: row.progress,
    healthScore: row.health_score,
    priorityScore: row.priority_score,
    startDate: row.start_date,
    endDate: row.end_date,
    deadline: row.end_date,
    budget: {
      allocated: Number(row.budget_allocated),
      spent: Number(row.budget_spent),
      currency: row.budget_currency,
    },
    owner: row.owner_id,
    team: row.team_member_ids ?? [],
    tags: row.tags ?? [],
    description: row.description,
    milestones: row.milestones ?? [],
    risks: row.risks ?? [],
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Casting date columns to text in SQL avoids node-postgres's date-object
// timezone-shift gotcha — we just want plain 'YYYY-MM-DD' strings back.
const PROJECT_COLUMNS = `
  id, name, client, status, priority, progress, health_score, priority_score,
  start_date::text, end_date::text, budget_allocated, budget_spent, budget_currency,
  owner_id, team_member_ids, tags, description, milestones, risks,
  archived_at, created_at, updated_at
`

async function logActivity(orgId, { projectId = null, actorUserId, type, message }) {
  await query(
    `INSERT INTO activity_log (organization_id, project_id, actor_user_id, type, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [orgId, projectId, actorUserId, type, message]
  )
}

function validateProjectInput(body, { partial = false } = {}) {
  const errors = []
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push('Project name must be at least 2 characters.')
    }
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`)
  }
  if (body.progress !== undefined && (Number(body.progress) < 0 || Number(body.progress) > 100)) {
    errors.push('Progress must be between 0 and 100.')
  }
  if (body.healthScore !== undefined && (Number(body.healthScore) < 0 || Number(body.healthScore) > 100)) {
    errors.push('Health score must be between 0 and 100.')
  }
  return errors
}

// ── GET /api/projects ───────────────────────────────────────────────
export async function listProjects(req, res) {
  const includeArchived = req.query.includeArchived === 'true'
  const clause = includeArchived ? '' : `AND status != 'archived'`
  const result = await query(
    `SELECT ${PROJECT_COLUMNS} FROM projects WHERE organization_id = $1 ${clause} ORDER BY created_at DESC`,
    [req.user.orgId]
  )
  res.json({ projects: result.rows.map(serializeProject) })
}

// ── GET /api/projects/:id ────────────────────────────────────────────
export async function getProject(req, res) {
  const result = await query(
    `SELECT ${PROJECT_COLUMNS} FROM projects WHERE id = $1 AND organization_id = $2`,
    [req.params.id, req.user.orgId]
  )
  if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found.' })
  res.json({ project: serializeProject(result.rows[0]) })
}

// ── POST /api/projects ───────────────────────────────────────────────
export async function createProject(req, res) {
  const body = req.body || {}
  const errors = validateProjectInput(body)
  if (errors.length > 0) return res.status(400).json({ error: errors[0] })

  const result = await query(
    `INSERT INTO projects (
       organization_id, name, client, status, priority, progress, health_score, priority_score,
       start_date, end_date, budget_allocated, budget_spent, budget_currency,
       owner_id, team_member_ids, tags, description, milestones, risks
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     RETURNING ${PROJECT_COLUMNS}`,
    [
      req.user.orgId,
      body.name.trim(),
      body.client?.trim() || '',
      body.status || 'planning',
      body.priority || 'medium',
      body.progress ?? 0,
      body.healthScore ?? 100,
      body.priorityScore ?? 50,
      body.startDate || null,
      body.endDate || body.deadline || null,
      body.budget?.allocated ?? 0,
      body.budget?.spent ?? 0,
      body.budget?.currency || '₹',
      body.owner || null,
      body.team || [],
      body.tags || [],
      body.description || '',
      JSON.stringify(body.milestones || []),
      JSON.stringify(body.risks || []),
    ]
  )

  const project = serializeProject(result.rows[0])
  await logActivity(req.user.orgId, {
    projectId: project.id,
    actorUserId: req.user.sub,
    type: 'project_created',
    message: `Created project "${project.name}"`,
  })

  res.status(201).json({ project })
}

// ── PATCH /api/projects/:id ──────────────────────────────────────────
// Partial update — only fields present in the body are changed.
export async function updateProject(req, res) {
  const body = req.body || {}
  const errors = validateProjectInput(body, { partial: true })
  if (errors.length > 0) return res.status(400).json({ error: errors[0] })

  const existing = await query(`SELECT ${PROJECT_COLUMNS} FROM projects WHERE id = $1 AND organization_id = $2`, [
    req.params.id,
    req.user.orgId,
  ])
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Project not found.' })
  const before = serializeProject(existing.rows[0])

  // Build the SET clause dynamically from whatever fields were sent.
  const fieldMap = {
    name: 'name',
    client: 'client',
    status: 'status',
    priority: 'priority',
    progress: 'progress',
    healthScore: 'health_score',
    priorityScore: 'priority_score',
    startDate: 'start_date',
    description: 'description',
    owner: 'owner_id',
  }
  const sets = []
  const values = []
  let i = 1

  for (const [key, column] of Object.entries(fieldMap)) {
    if (body[key] !== undefined) {
      sets.push(`${column} = $${i++}`)
      values.push(body[key])
    }
  }
  if (body.endDate !== undefined || body.deadline !== undefined) {
    sets.push(`end_date = $${i++}`)
    values.push(body.endDate ?? body.deadline)
  }
  if (body.budget !== undefined) {
    if (body.budget.allocated !== undefined) { sets.push(`budget_allocated = $${i++}`); values.push(body.budget.allocated) }
    if (body.budget.spent !== undefined) { sets.push(`budget_spent = $${i++}`); values.push(body.budget.spent) }
    if (body.budget.currency !== undefined) { sets.push(`budget_currency = $${i++}`); values.push(body.budget.currency) }
  }
  if (body.team !== undefined) { sets.push(`team_member_ids = $${i++}`); values.push(body.team) }
  if (body.tags !== undefined) { sets.push(`tags = $${i++}`); values.push(body.tags) }
  if (body.milestones !== undefined) { sets.push(`milestones = $${i++}`); values.push(JSON.stringify(body.milestones)) }
  if (body.risks !== undefined) { sets.push(`risks = $${i++}`); values.push(JSON.stringify(body.risks)) }

  if (sets.length === 0) return res.status(400).json({ error: 'No fields to update.' })

  values.push(req.params.id, req.user.orgId)
  const result = await query(
    `UPDATE projects SET ${sets.join(', ')} WHERE id = $${i++} AND organization_id = $${i} RETURNING ${PROJECT_COLUMNS}`,
    values
  )

  const project = serializeProject(result.rows[0])

  // Log the most meaningful thing that changed, not just "project updated".
  if (body.status !== undefined && body.status !== before.status) {
    await logActivity(req.user.orgId, {
      projectId: project.id, actorUserId: req.user.sub, type: 'status_change',
      message: `"${project.name}" moved from ${before.status} to ${body.status}`,
    })
  } else if (body.budget?.spent !== undefined && Number(body.budget.spent) !== before.budget.spent) {
    await logActivity(req.user.orgId, {
      projectId: project.id, actorUserId: req.user.sub, type: 'budget_update',
      message: `Updated spend on "${project.name}"`,
    })
  } else {
    await logActivity(req.user.orgId, {
      projectId: project.id, actorUserId: req.user.sub, type: 'project_updated',
      message: `Updated "${project.name}"`,
    })
  }

  res.json({ project })
}

// ── POST /api/projects/:id/archive ───────────────────────────────────
export async function archiveProject(req, res) {
  const result = await query(
    `UPDATE projects SET status = 'archived', archived_at = now()
     WHERE id = $1 AND organization_id = $2 RETURNING ${PROJECT_COLUMNS}`,
    [req.params.id, req.user.orgId]
  )
  if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found.' })
  const project = serializeProject(result.rows[0])

  await logActivity(req.user.orgId, {
    projectId: project.id, actorUserId: req.user.sub, type: 'project_archived',
    message: `Archived "${project.name}"`,
  })

  res.json({ project })
}

// ── POST /api/projects/:id/unarchive ─────────────────────────────────
export async function unarchiveProject(req, res) {
  const result = await query(
    `UPDATE projects SET status = 'active', archived_at = NULL
     WHERE id = $1 AND organization_id = $2 RETURNING ${PROJECT_COLUMNS}`,
    [req.params.id, req.user.orgId]
  )
  if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found.' })
  const project = serializeProject(result.rows[0])

  await logActivity(req.user.orgId, {
    projectId: project.id, actorUserId: req.user.sub, type: 'project_updated',
    message: `Restored "${project.name}" from archive`,
  })

  res.json({ project })
}

// ── DELETE /api/projects/:id ──────────────────────────────────────────
export async function deleteProject(req, res) {
  const existing = await query('SELECT name FROM projects WHERE id = $1 AND organization_id = $2', [
    req.params.id,
    req.user.orgId,
  ])
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Project not found.' })

  // Log before deleting — the FK is ON DELETE SET NULL, so the activity
  // row survives (with project_id cleared) as an audit trail entry.
  await logActivity(req.user.orgId, {
    projectId: req.params.id, actorUserId: req.user.sub, type: 'project_deleted',
    message: `Deleted "${existing.rows[0].name}"`,
  })

  await query('DELETE FROM projects WHERE id = $1 AND organization_id = $2', [req.params.id, req.user.orgId])
  res.status(204).send()
}
