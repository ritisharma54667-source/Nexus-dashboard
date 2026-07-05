import { Download, FileText, TrendingUp, AlertTriangle } from 'lucide-react'
import { useProjectStore, useTeamStore } from '../../store'
import { formatCurrency, healthColor } from '../../utils'
import styles from './ReportsView.module.css'

function exportCSV(projects) {
  const headers = ['Name', 'Client', 'Status', 'Progress', 'Health Score', 'Budget Allocated', 'Budget Spent', 'Deadline']
  const rows = projects.map((p) => [
    p.name, p.client, p.status, p.progress, p.healthScore, p.budget.allocated, p.budget.spent, p.deadline,
  ])
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nexus-portfolio-report-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsView() {
  const projects = useProjectStore((s) => s.projects)
  const members  = useTeamStore((s) => s.members)

  const avgHealth   = projects.length > 0
    ? Math.round(projects.reduce((a, p) => a + p.healthScore, 0) / projects.length)
    : 0
  const totalBudget = projects.reduce((a, p) => a + p.budget.allocated, 0)
  const totalSpent  = projects.reduce((a, p) => a + p.budget.spent, 0)
  const onTimeCount = projects.filter((p) => p.healthScore >= 70).length

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reports</h2>
          <p className={styles.sub}>Export portfolio data and view summary analytics</p>
        </div>
        <button className={styles.exportBtn} onClick={() => exportCSV(projects)}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary report card */}
      <div className={styles.reportCard}>
        <div className={styles.reportHeader}>
          <FileText size={16} style={{ color: 'var(--accent)' }} />
          <h3>Portfolio Summary — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Total Projects</p>
            <p className={styles.statValue}>{projects.length}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Avg Health Score</p>
            <p className={styles.statValue} style={{ color: healthColor(avgHealth) }}>{avgHealth}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>On Track</p>
            <p className={styles.statValue} style={{ color: 'var(--success)' }}>{onTimeCount}/{projects.length}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Budget Utilization</p>
            <p className={styles.statValue}>{Math.round((totalSpent / totalBudget) * 100)}%</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Team Size</p>
            <p className={styles.statValue}>{members.length}</p>
          </div>
        </div>
      </div>

      {/* Per-project breakdown */}
      <div className={styles.reportCard}>
        <div className={styles.reportHeader}>
          <TrendingUp size={16} style={{ color: 'var(--accent2)' }} />
          <h3>Project Breakdown</h3>
        </div>
        <div className={styles.breakdownList}>
          {projects.map((p) => (
            <div key={p.id} className={styles.breakdownRow}>
              <div className={styles.breakdownInfo}>
                <p className={styles.breakdownName}>{p.name}</p>
                <p className={styles.breakdownClient}>{p.client}</p>
              </div>
              <div className={styles.breakdownMetrics}>
                <span>{p.progress}% complete</span>
                <span>{formatCurrency(p.budget.spent)} spent</span>
                <span style={{ color: healthColor(p.healthScore), fontWeight: 700 }}>{p.healthScore} health</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk summary */}
      <div className={styles.reportCard}>
        <div className={styles.reportHeader}>
          <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
          <h3>Open Risks Summary</h3>
        </div>
        <div className={styles.breakdownList}>
          {projects.flatMap((p) => p.risks.filter((r) => r.status === 'open').map((r) => ({ ...r, projectName: p.name })))
            .map((r) => (
              <div key={r.id} className={styles.breakdownRow}>
                <div className={styles.breakdownInfo}>
                  <p className={styles.breakdownName}>{r.title}</p>
                  <p className={styles.breakdownClient}>{r.projectName}</p>
                </div>
                <span className={styles.severityTag}>{r.severity}</span>
              </div>
            ))}
          {projects.every((p) => p.risks.filter((r) => r.status === 'open').length === 0) && (
            <p className={styles.noRisks}>No open risks across the portfolio. 🎉</p>
          )}
        </div>
      </div>
    </div>
  )
}
