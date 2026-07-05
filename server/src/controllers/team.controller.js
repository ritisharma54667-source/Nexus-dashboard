/**
 * controllers/team.controller.js
 *
 * CRUD over the team_members roster (the people projects can be
 * staffed with — see schema.sql for why this is separate from
 * organization_members/real logins).
 */

import { query } from '../db/pool.js'

function serialize(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role_title,
    department: row.department,
    initials: row.initials,
    color: row.color,
    workload: row.workload,
  }
}

export async function listTeam(req, res) {
  const result = await query(
    `SELECT * FROM team_members WHERE organization_id = $1 ORDER BY created_at ASC`,
    [req.user.orgId]
  )
  res.json({ team: result.rows.map(serialize) })
}

export async function createTeamMember(req, res) {
  const { name, role, department, workload } = req.body || {}
  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' })
  }
  const initials = name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['#3A75C4', '#8CA654', '#F97316', '#8B5CF6', '#EF4444', '#22C55E', '#F59E0B', '#06B6D4']
  const color = colors[Math.floor(Math.random() * colors.length)]

  const result = await query(
    `INSERT INTO team_members (organization_id, name, role_title, department, initials, color, workload)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.orgId, name.trim(), role || 'Team Member', department || 'General', initials, color, workload ?? 0]
  )
  res.status(201).json({ member: serialize(result.rows[0]) })
}

export async function updateTeamMember(req, res) {
  const { name, role, department, workload } = req.body || {}
  const result = await query(
    `UPDATE team_members SET
       name = COALESCE($1, name),
       role_title = COALESCE($2, role_title),
       department = COALESCE($3, department),
       workload = COALESCE($4, workload)
     WHERE id = $5 AND organization_id = $6 RETURNING *`,
    [name, role, department, workload, req.params.id, req.user.orgId]
  )
  if (result.rows.length === 0) return res.status(404).json({ error: 'Team member not found.' })
  res.json({ member: serialize(result.rows[0]) })
}

export async function deleteTeamMember(req, res) {
  const result = await query('DELETE FROM team_members WHERE id = $1 AND organization_id = $2 RETURNING id', [
    req.params.id,
    req.user.orgId,
  ])
  if (result.rows.length === 0) return res.status(404).json({ error: 'Team member not found.' })
  res.status(204).send()
}
