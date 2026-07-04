import { AlertTriangle, CheckCircle2, MessageSquare, DollarSign, Info, Shield } from 'lucide-react'
import { ACTIVITIES } from '../../data/mockData'
import { useProjectStore, useTeamStore } from '../../store'
import { relativeDate, healthColor } from '../../utils'
import styles from './Insights.module.css'

const TYPE_META = {
  status_change:       { icon: Info,          color: 'var(--accent)'   },
  milestone_complete:  { icon: CheckCircle2,  color: 'var(--success)'  },
  risk_added:          { icon: AlertTriangle, color: 'var(--danger)'   },
  budget_update:       { icon: DollarSign,    color: 'var(--accent2)'  },
  comment:             { icon: MessageSquare, color: 'var(--text-muted)'},
}

export default function Insights() {
  const projects = useProjectStore((s) => s.projects)
  const members  = useTeamStore((s) => s.members)

  const atRisk     = projects.filter((p) => p.healthScore < 60)
  const overBudget = projects.filter((p) => (p.budget.spent / p.budget.allocated) > 0.9 && p.status !== 'completed')
  const overdueMS  = projects.filter((p) => p.milestones.some((m) => m.status === 'overdue'))

  return (
    <div className={styles.grid}>

      {/* ── Insights + Risk Radar ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Shield size={15} style={{ color: 'var(--accent)' }} />
          <h3 className={styles.cardTitle}>Insights</h3>
        </div>

        <div className={styles.insightsList}>
          {atRisk.length === 0 && overBudget.length === 0 && overdueMS.length === 0 && (
            <div className={styles.insight} style={{ borderLeftColor: 'var(--success)' }}>
              <p className={styles.insightTitle}>
                <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />
                Portfolio looks healthy
              </p>
              <p className={styles.insightSub}>No critical issues detected this week</p>
            </div>
          )}

          {atRisk.map((p) => (
            <div key={p.id} className={styles.insight} style={{ borderLeftColor: 'var(--danger)' }}>
              <p className={styles.insightTitle}>
                <AlertTriangle size={13} style={{ color: 'var(--danger)' }} />
                {p.name} is critically at risk
              </p>
              <p className={styles.insightSub}>Health score: {p.healthScore}/100 — review immediately</p>
            </div>
          ))}

          {overBudget.map((p) => (
            <div key={p.id} className={styles.insight} style={{ borderLeftColor: 'var(--warning)' }}>
              <p className={styles.insightTitle}>
                <DollarSign size={13} style={{ color: 'var(--warning)' }} />
                {p.name} is over 90% budget
              </p>
              <p className={styles.insightSub}>
                {Math.round((p.budget.spent / p.budget.allocated) * 100)}% utilized — {p.budget.currency}{((p.budget.allocated - p.budget.spent) / 100000).toFixed(1)}L remaining
              </p>
            </div>
          ))}

          {overdueMS.map((p) => (
            <div key={p.id} className={styles.insight} style={{ borderLeftColor: 'var(--warning)' }}>
              <p className={styles.insightTitle}>
                <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
                Overdue milestone in {p.name}
              </p>
              <p className={styles.insightSub}>
                {p.milestones.filter((m) => m.status === 'overdue').map((m) => m.title).join(', ')}
              </p>
            </div>
          ))}
        </div>

        {/* Risk Radar */}
        <div className={styles.radarSection}>
          <p className={styles.radarTitle}>Risk Radar — Active Projects</p>
          <div className={styles.radarList}>
            {projects
              .filter((p) => p.status !== 'completed')
              .sort((a, b) => a.healthScore - b.healthScore)
              .map((p) => (
                <div key={p.id} className={styles.radarRow}>
                  <span className={styles.radarName} title={p.name}>{p.name}</span>
                  <div className={styles.radarBarTrack}>
                    <div
                      className={styles.radarBarFill}
                      style={{ width: `${p.healthScore}%`, background: healthColor(p.healthScore) }}
                    />
                  </div>
                  <span className={styles.radarScore} style={{ color: healthColor(p.healthScore) }}>
                    {p.healthScore}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ── Activity Stream ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Activity Stream</h3>
          <span className={styles.live}><span className={styles.liveDot} />Live</span>
        </div>

        <div className={styles.activityList}>
          {ACTIVITIES.map((a) => {
            const { icon: Icon, color } = TYPE_META[a.type] ?? TYPE_META.comment
            const member  = members.find((m) => m.id === a.userId)
            const project = projects.find((p) => p.id === a.projectId)
            return (
              <div key={a.id} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{ background: `${color}22`, color }}>
                  <Icon size={12} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityMsg}>{a.message}</p>
                  <p className={styles.activityMeta}>
                    <span style={{ color: member?.color ?? 'var(--accent)' }}>
                      {member?.name ?? 'System'}
                    </span>
                    {project && <> · {project.name}</>}
                    {' · '}{relativeDate(a.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
