/**
 * controllers/analytics.controller.js
 *
 * Real aggregate stats computed from the projects table — powers
 * KPICards, the status-distribution donut, and the risk radar.
 *
 * Honest gap: there's no historical snapshot table, so a true month-
 * over-month "budget trend" line chart isn't derivable from current
 * data yet — that needs a scheduled job that snapshots totals over
 * time. This endpoint returns real current-state aggregates only; the
 * frontend's Budget Trend chart stays on illustrative data until that
 * snapshot infra exists (see server/README.md).
 */

import { query } from '../db/pool.js'

export async function getAnalytics(req, res) {
  const orgId = req.user.orgId

  const [totals, byStatus, teamAgg, riskAgg] = await Promise.all([
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status != 'archived')::int AS total_projects,
         COALESCE(AVG(health_score) FILTER (WHERE status != 'archived'), 0)::int AS avg_health,
         COALESCE(SUM(budget_allocated) FILTER (WHERE status != 'archived'), 0) AS total_allocated,
         COALESCE(SUM(budget_spent) FILTER (WHERE status != 'archived'), 0) AS total_spent
       FROM projects WHERE organization_id = $1`,
      [orgId]
    ),
    query(
      `SELECT status, COUNT(*)::int AS count
       FROM projects WHERE organization_id = $1 AND status != 'archived'
       GROUP BY status`,
      [orgId]
    ),
    query(
      `SELECT
         COUNT(*)::int AS member_count,
         COUNT(*) FILTER (WHERE workload > 85)::int AS overloaded_count,
         COALESCE(AVG(workload), 0)::int AS avg_workload
       FROM team_members WHERE organization_id = $1`,
      [orgId]
    ),
    query(
      `SELECT COUNT(*)::int AS open_risk_count
       FROM projects, jsonb_array_elements(risks) AS r
       WHERE organization_id = $1 AND status != 'archived' AND r->>'status' = 'open'`,
      [orgId]
    ),
  ])

  const t = totals.rows[0]
  const statusCounts = Object.fromEntries(byStatus.rows.map((r) => [r.status, r.count]))
  const team = teamAgg.rows[0]

  res.json({
    totals: {
      totalProjects: t.total_projects,
      avgHealth: t.avg_health,
      totalAllocated: Number(t.total_allocated),
      totalSpent: Number(t.total_spent),
      budgetUtilization: t.total_allocated > 0 ? Math.round((t.total_spent / t.total_allocated) * 100) : 0,
    },
    statusDistribution: {
      active: statusCounts.active || 0,
      'at-risk': statusCounts['at-risk'] || 0,
      planning: statusCounts.planning || 0,
      'on-hold': statusCounts['on-hold'] || 0,
      completed: statusCounts.completed || 0,
    },
    team: {
      memberCount: team.member_count,
      overloadedCount: team.overloaded_count,
      avgWorkload: team.avg_workload,
    },
    openRiskCount: riskAgg.rows[0].open_risk_count,
  })
}
