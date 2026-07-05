/**
 * controllers/activity.controller.js
 * Read-only feed over activity_log, written to by the projects controller.
 */

import { query } from '../db/pool.js'

export async function listActivity(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 100)

  const result = await query(
    `SELECT a.id, a.project_id, a.type, a.message, a.created_at, u.name AS actor_name
     FROM activity_log a
     LEFT JOIN users u ON u.id = a.actor_user_id
     WHERE a.organization_id = $1
     ORDER BY a.created_at DESC
     LIMIT $2`,
    [req.user.orgId, limit]
  )

  res.json({
    activity: result.rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      userName: r.actor_name,
      type: r.type,
      message: r.message,
      timestamp: r.created_at,
    })),
  })
}
