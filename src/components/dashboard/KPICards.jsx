import { TrendingUp, AlertTriangle, DollarSign, Users, CheckCircle2, Clock } from 'lucide-react'
import { useProjectStore, useTeamStore } from '../../store'
import { formatCurrency } from '../../utils'
import styles from './KPICards.module.css'

function KPICard({ icon: Icon, iconColor, label, value, sub, subColor }) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap} style={{ background: `${iconColor}20`, color: iconColor }}>
        <Icon size={18} />
      </div>
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
        {sub && <p className={styles.sub} style={{ color: subColor ?? 'var(--text-faint)' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function KPICards() {
  const projects = useProjectStore((s) => s.projects)
  const members  = useTeamStore((s) => s.members)

  const active    = projects.filter((p) => p.status === 'active').length
  const atRisk    = projects.filter((p) => p.status === 'at-risk' || p.healthScore < 60).length
  const completed = projects.filter((p) => p.status === 'completed').length

  const totalBudget = projects.reduce((a, p) => a + p.budget.allocated, 0)
  const totalSpent  = projects.reduce((a, p) => a + p.budget.spent, 0)
  const budgetPct   = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const overloaded = members.filter((m) => m.workload >= 80).length
  const avgHealth  = projects.length > 0
    ? Math.round(projects.reduce((a, p) => a + p.healthScore, 0) / projects.length)
    : 0

  return (
    <div className={styles.grid}>
      <KPICard
        icon={TrendingUp}
        iconColor="var(--accent)"
        label="Active Projects"
        value={active}
        sub={`${projects.length} total in portfolio`}
      />
      <KPICard
        icon={AlertTriangle}
        iconColor="var(--danger)"
        label="At Risk"
        value={atRisk}
        sub={atRisk > 0 ? 'Needs immediate attention' : 'All healthy'}
        subColor={atRisk > 0 ? 'var(--danger)' : 'var(--success)'}
      />
      <KPICard
        icon={DollarSign}
        iconColor="var(--accent2)"
        label="Budget Utilized"
        value={`${budgetPct}%`}
        sub={`${formatCurrency(totalSpent)} of ${formatCurrency(totalBudget)}`}
      />
      <KPICard
        icon={Users}
        iconColor="var(--warning)"
        label="Team Overloaded"
        value={`${overloaded}/${members.length}`}
        sub={overloaded > 0 ? 'Members above 80% capacity' : 'Workload balanced'}
        subColor={overloaded > 2 ? 'var(--danger)' : overloaded > 0 ? 'var(--warning)' : 'var(--success)'}
      />
      <KPICard
        icon={CheckCircle2}
        iconColor="var(--success)"
        label="Completed"
        value={completed}
        sub="This quarter"
      />
      <KPICard
        icon={Clock}
        iconColor="var(--warning)"
        label="Avg Health Score"
        value={avgHealth}
        sub={avgHealth >= 75 ? 'Portfolio healthy' : 'Review required'}
        subColor={avgHealth >= 75 ? 'var(--success)' : 'var(--warning)'}
      />
    </div>
  )
}
