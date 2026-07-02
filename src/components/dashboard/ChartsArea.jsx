import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { MONTHLY_BUDGET_DATA, STATUS_DISTRIBUTION } from '../../data/mockData'
import { formatCurrency } from '../../utils'
import styles from './ChartsArea.module.css'

const CustomTooltipBudget = ({ active, payload, label }) => {
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

const CustomTooltipPie = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
      <p className={styles.tooltipValue}>{payload[0].value} project{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function ChartsArea() {
  const data = useMemo(() => MONTHLY_BUDGET_DATA, [])

  return (
    <div className={styles.grid}>
      {/* Budget Trend */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Budget Trend</h3>
            <p className={styles.cardSub}>Allocated vs actual spend per month</p>
          </div>
          <div className={styles.legend}>
            <span className={styles.dot} style={{ background: 'var(--accent)' }} /> Allocated
            <span className={styles.dot} style={{ background: 'var(--warning)' }} /> Spent
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gAlloc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3A75C4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3A75C4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} width={60} />
            <Tooltip content={<CustomTooltipBudget />} />
            <Area type="monotone" dataKey="allocated" stroke="#3A75C4" strokeWidth={2} fill="url(#gAlloc)" />
            <Area type="monotone" dataKey="spent"     stroke="#F97316" strokeWidth={2} fill="url(#gSpent)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Portfolio Status</h3>
            <p className={styles.cardSub}>Distribution by project status</p>
          </div>
        </div>
        <div className={styles.pieWrap}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={STATUS_DISTRIBUTION}
                cx="40%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {STATUS_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipPie />} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.pieLegend}>
            {STATUS_DISTRIBUTION.map((s) => (
              <div key={s.name} className={styles.pieLegendItem}>
                <span className={styles.dot} style={{ background: s.color }} />
                <span className={styles.pieLegendLabel}>{s.name}</span>
                <span className={styles.pieLegendVal}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
