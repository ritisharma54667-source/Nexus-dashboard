import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useProjectStore } from '../../store'
import { formatCurrency } from '../../utils'
import styles from './BudgetView.module.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'allocated' ? 'Allocated' : 'Spent'}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function BudgetView() {
  const projects = useProjectStore((s) => s.projects)

  const chartData = useMemo(
    () => projects.map((p) => ({
      name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
      allocated: p.budget.allocated,
      spent: p.budget.spent,
      status: p.status,
    })),
    [projects]
  )

  const totalAllocated = projects.reduce((a, p) => a + p.budget.allocated, 0)
  const totalSpent      = projects.reduce((a, p) => a + p.budget.spent, 0)
  const remaining        = totalAllocated - totalSpent
  const overBudgetCount  = projects.filter((p) => p.budget.spent > p.budget.allocated).length

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Budget Analysis</h2>
        <p className={styles.sub}>Allocation and spend across the entire portfolio</p>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Total Allocated</p>
          <p className={styles.summaryValue}>{formatCurrency(totalAllocated)}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Total Spent</p>
          <p className={styles.summaryValue} style={{ color: 'var(--warning)' }}>{formatCurrency(totalSpent)}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Remaining</p>
          <p className={styles.summaryValue} style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Over Budget</p>
          <p className={styles.summaryValue} style={{ color: overBudgetCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {overBudgetCount} project{overBudgetCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Bar chart per project */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>Allocated vs Spent by Project</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94A3B8', fontSize: 10.5 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v)}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="allocated" fill="#3A75C4" radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="spent" fill="#F97316" radius={[4,4,0,0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget table */}
      <div className={styles.tableCard}>
        <p className={styles.chartTitle}>Budget Detail</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Allocated</th>
                <th>Spent</th>
                <th>Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const pct = p.budget.allocated > 0 ? Math.round((p.budget.spent / p.budget.allocated) * 100) : 0
                const over = pct > 100
                return (
                  <tr key={p.id}>
                    <td className={styles.nameCell}>{p.name}</td>
                    <td>{formatCurrency(p.budget.allocated)}</td>
                    <td>{formatCurrency(p.budget.spent)}</td>
                    <td>
                      <div className={styles.utilWrap}>
                        <div className={styles.utilTrack}>
                          <div
                            className={styles.utilFill}
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: over ? 'var(--danger)' : pct > 85 ? 'var(--warning)' : 'var(--success)',
                            }}
                          />
                        </div>
                        <span>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.statusTag} style={{
                        color: over ? 'var(--danger)' : 'var(--success)',
                        background: over ? 'var(--danger-dim)' : 'var(--success-dim)',
                      }}>
                        {over ? 'Over Budget' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
