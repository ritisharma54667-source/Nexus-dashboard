import { X, AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, Pencil, Archive, Trash2 } from 'lucide-react'
import { useProjectStore, useTeamStore } from '../../store'
import { STATUS_META, PRIORITY_META, SEVERITY_META, healthColor, healthLabel, formatCurrency, absDate } from '../../utils'
import styles from './ProjectDrawer.module.css'

function RiskItem({ risk }) {
  const meta = SEVERITY_META[risk.severity] ?? { label: risk.severity, color: '#94A3B8' }
  return (
    <div className={styles.riskItem}>
      <div className={styles.riskSeverity} style={{ background: `${meta.color}22`, color: meta.color }}>
        {meta.label}
      </div>
      <div className={styles.riskContent}>
        <p className={styles.riskTitle}>{risk.title}</p>
        <p className={styles.riskMeta}>
          Status: <span style={{ color: risk.status === 'open' ? 'var(--danger)' : 'var(--success)' }}>
            {risk.status}
          </span>
        </p>
      </div>
    </div>
  )
}

function MilestoneItem({ milestone }) {
  const statusMeta = {
    completed:   { icon: CheckCircle2, color: 'var(--success)' },
    'in-progress':{ icon: Clock,       color: 'var(--accent)' },
    pending:     { icon: Clock,        color: 'var(--text-faint)' },
    overdue:     { icon: AlertTriangle,color: 'var(--danger)' },
    'on-hold':   { icon: Clock,        color: 'var(--text-muted)' },
  }
  const { icon: Icon, color } = statusMeta[milestone.status] ?? statusMeta.pending

  return (
    <div className={styles.milestone}>
      <Icon size={14} style={{ color, flexShrink: 0 }} />
      <div className={styles.milestoneContent}>
        <p className={styles.milestoneTitle}>{milestone.title}</p>
        <p className={styles.milestoneDue}>{absDate(milestone.dueDate)}</p>
      </div>
      <span className={styles.milestoneStatus} style={{ color }}>{milestone.status}</span>
    </div>
  )
}

export default function ProjectDrawer({ onEdit, onArchiveToggle, onDelete }) {
  const { selectedProjectId, clearSelection, projects } = useProjectStore()
  const members = useTeamStore((s) => s.members)

  const project = projects.find((p) => p.id === selectedProjectId)

  if (!project) return null

  const statusMeta   = STATUS_META[project.status]   ?? { label: project.status,   color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' }
  const priorityMeta = PRIORITY_META[project.priority] ?? { label: project.priority, color: '#94A3B8' }
  const budgetPct    = project.budget.allocated > 0 ? Math.round((project.budget.spent / project.budget.allocated) * 100) : 0
  const teamMembers  = project.team.map((id) => members.find((m) => m.id === id)).filter(Boolean)
  const completedMS  = project.milestones.filter((m) => m.status === 'completed').length
  const isArchived   = project.status === 'archived'

  return (
    <>
      <div className={styles.overlay} onClick={clearSelection} />
      <aside className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.badge} style={{ color: statusMeta.color, background: statusMeta.bg }}>
              {statusMeta.label}
            </span>
            <span className={styles.priority} style={{ color: priorityMeta.color }}>
              ● {priorityMeta.label} priority
            </span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={() => onEdit?.(project)}>
              <Pencil size={13} /> <span>Edit</span>
            </button>
            <button className={styles.actionBtn} onClick={() => onArchiveToggle?.(project)}>
              <Archive size={13} /> <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>
            <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => onDelete?.(project)}>
              <Trash2 size={13} /> <span>Delete</span>
            </button>
            <button className={styles.closeBtn} onClick={clearSelection}><X size={18} /></button>
          </div>
        </div>

        <div className={styles.body}>
          <h2 className={styles.projectName}>{project.name}</h2>
          <p className={styles.client}>{project.client}</p>
          <p className={styles.description}>{project.description}</p>

          {/* Health Score */}
          <div className={styles.healthCard} style={{ borderColor: healthColor(project.healthScore) }}>
            <div>
              <p className={styles.healthLabel}>Health Score</p>
              <p className={styles.healthValue} style={{ color: healthColor(project.healthScore) }}>
                {project.healthScore} / 100
              </p>
              <p className={styles.healthSub}>{healthLabel(project.healthScore)}</p>
            </div>
            <div className={styles.healthRing}>
              <svg viewBox="0 0 80 80" width="80" height="80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke={healthColor(project.healthScore)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(project.healthScore / 100) * 213.6} 213.6`}
                  transform="rotate(-90 40 40)"
                />
                <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill={healthColor(project.healthScore)}>
                  {project.healthScore}
                </text>
              </svg>
            </div>
          </div>

          {/* Progress + Budget */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
              <p className={styles.statLabel}>Progress</p>
              <p className={styles.statValue}>{project.progress}%</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${project.progress}%` }} />
              </div>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Budget</p>
              <p className={styles.statValue}>{budgetPct}%</p>
              <p className={styles.statSub}>{formatCurrency(project.budget.spent)} / {formatCurrency(project.budget.allocated)}</p>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(budgetPct, 100)}%`, background: budgetPct > 95 ? 'var(--danger)' : 'var(--accent2)' }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Timeline</p>
            <div className={styles.dateRow}>
              <span className={styles.dateLabel}>Start</span>
              <span className={styles.dateVal}>{absDate(project.startDate)}</span>
            </div>
            <div className={styles.dateRow}>
              <span className={styles.dateLabel}>Deadline</span>
              <span className={styles.dateVal}>{absDate(project.deadline)}</span>
            </div>
          </div>

          {/* Milestones */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>
              Milestones
              <span className={styles.sectionCount}>{completedMS}/{project.milestones.length}</span>
            </p>
            <div className={styles.milestoneList}>
              {project.milestones.map((m) => <MilestoneItem key={m.id} milestone={m} />)}
            </div>
          </div>

          {/* Risks */}
          {project.risks.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>
                Risks
                <span className={styles.sectionCount} style={{ color: 'var(--danger)', background: 'var(--danger-dim)' }}>
                  {project.risks.filter((r) => r.status === 'open').length} open
                </span>
              </p>
              <div className={styles.riskList}>
                {project.risks.map((r) => <RiskItem key={r.id} risk={r} />)}
              </div>
            </div>
          )}

          {/* Team */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>
              <Users size={13} /> Team ({teamMembers.length})
            </p>
            <div className={styles.teamList}>
              {teamMembers.map((m) => (
                <div key={m.id} className={styles.teamMember}>
                  <div className={styles.teamAvatar} style={{ background: m.color }}>{m.initials}</div>
                  <div>
                    <p className={styles.teamName}>{m.name}</p>
                    <p className={styles.teamRole}>{m.role}</p>
                  </div>
                  <div
                    className={styles.workloadBadge}
                    style={{ color: m.workload >= 85 ? 'var(--danger)' : m.workload >= 70 ? 'var(--warning)' : 'var(--success)' }}
                  >
                    {m.workload}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
