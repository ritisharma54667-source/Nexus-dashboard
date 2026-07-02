import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, SlidersHorizontal, ExternalLink } from 'lucide-react'
import { useProjectStore, useTeamStore } from '../../store'
import { STATUS_META, PRIORITY_META, healthColor, formatCurrency, absDate, daysUntil } from '../../utils'
import styles from './ProjectTable.module.css'

const SMART_FILTERS = [
  { id: null,          label: 'All' },
  { id: 'late',        label: '🔴 Late / At Risk' },
  { id: 'over-budget', label: '⚠️ Over Budget' },
  { id: 'needs-review',label: '📋 Open Risks' },
]

function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy !== field) return <ChevronsUpDown size={13} className={styles.sortIcon} />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className={styles.sortIconActive} />
    : <ChevronDown size={13} className={styles.sortIconActive} />
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' }
  return (
    <span className={styles.badge} style={{ color: meta.color, background: meta.bg }}>
      {meta.label}
    </span>
  )
}

function PriorityDot({ priority }) {
  const meta = PRIORITY_META[priority] ?? { color: '#94A3B8' }
  return <span className={styles.priorityDot} style={{ background: meta.color }} title={priority} />
}

function HealthBar({ score }) {
  return (
    <div className={styles.healthBarWrap} title={`Health: ${score}/100`}>
      <div className={styles.healthBarTrack}>
        <div
          className={styles.healthBarFill}
          style={{ width: `${score}%`, background: healthColor(score) }}
        />
      </div>
      <span className={styles.healthScore} style={{ color: healthColor(score) }}>{score}</span>
    </div>
  )
}

function AvatarStack({ memberIds, members }) {
  const shown = memberIds.slice(0, 3)
  const rest  = memberIds.length - 3
  return (
    <div className={styles.avatars}>
      {shown.map((id) => {
        const m = members.find((m) => m.id === id)
        if (!m) return null
        return (
          <div key={id} className={styles.avatarChip} style={{ background: m.color ?? 'var(--accent)' }} title={m.name}>
            {m.initials}
          </div>
        )
      })}
      {rest > 0 && <div className={styles.avatarMore}>+{rest}</div>}
    </div>
  )
}

export default function ProjectTable() {
  const { filters, setFilter, setSort, sortBy, sortDir, selectProject, getFilteredProjects } = useProjectStore()
  const members  = useTeamStore((s) => s.members)
  const [page, setPage]   = useState(1)
  const PER_PAGE = 5

  const filtered = getFilteredProjects()
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleSort = (field) => { setSort(field); setPage(1) }

  const COLS = [
    { key: 'name',          label: 'Project' },
    { key: 'status',        label: 'Status' },
    { key: 'progress',      label: 'Progress' },
    { key: 'healthScore',   label: 'Health' },
    { key: 'budget',        label: 'Budget' },
    { key: 'deadline',      label: 'Deadline' },
    { key: 'team',          label: 'Team' },
  ]

  return (
    <div className={styles.wrap}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h3 className={styles.title}>Projects</h3>
          <span className={styles.count}>{filtered.length} results</span>
        </div>
        <div className={styles.toolbarRight}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={13} />
            <input
              className={styles.searchInput}
              placeholder="Search projects…"
              value={filters.search}
              onChange={(e) => { setFilter('search', e.target.value); setPage(1) }}
            />
          </div>

          {/* Status filter */}
          <select
            className={styles.select}
            value={filters.status}
            onChange={(e) => { setFilter('status', e.target.value); setPage(1) }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
            <option value="planning">Planning</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          {/* Smart filters */}
          <div className={styles.smartFilters}>
            {SMART_FILTERS.map((f) => (
              <button
                key={String(f.id)}
                className={`${styles.smartBtn} ${filters.smart === f.id ? styles.smartActive : ''}`}
                onClick={() => { setFilter('smart', filters.smart === f.id ? null : f.id); setPage(1) }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLS.map(({ key, label }) => (
                <th key={key} className={styles.th} onClick={() => handleSort(key)}>
                  <div className={styles.thInner}>
                    {label}
                    <SortIcon field={key} sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
              ))}
              <th className={styles.th} />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 1} className={styles.empty}>
                  <p>No projects match your filters.</p>
                  <button onClick={() => { setFilter('status','all'); setFilter('search',''); setFilter('smart',null) }}>
                    Clear filters
                  </button>
                </td>
              </tr>
            ) : visible.map((p) => {
              const days = daysUntil(p.deadline)
              const budgetPct = Math.round((p.budget.spent / p.budget.allocated) * 100)
              return (
                <tr key={p.id} className={styles.row} onClick={() => selectProject(p.id)}>
                  <td className={styles.tdName}>
                    <div className={styles.projectName}>
                      <PriorityDot priority={p.priority} />
                      <div>
                        <p className={styles.nameText}>{p.name}</p>
                        <p className={styles.client}>{p.client}</p>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div className={styles.progressWrap}>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className={styles.progressPct}>{p.progress}%</span>
                    </div>
                  </td>
                  <td><HealthBar score={p.healthScore} /></td>
                  <td>
                    <p className={styles.budgetSpent}>{formatCurrency(p.budget.spent)}</p>
                    <p className={`${styles.budgetOf} ${budgetPct > 95 ? styles.budgetDanger : ''}`}>
                      {budgetPct}% of {formatCurrency(p.budget.allocated)}
                    </p>
                  </td>
                  <td>
                    <p className={styles.deadlineDate} title={absDate(p.deadline)}>
                      {absDate(p.deadline)}
                    </p>
                    <p className={`${styles.deadlineDays} ${days !== null && days < 14 ? styles.urgent : ''}`}>
                      {days === null ? '—' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </p>
                  </td>
                  <td><AvatarStack memberIds={p.team} members={members} /></td>
                  <td>
                    <button className={styles.detailBtn} onClick={(e) => { e.stopPropagation(); selectProject(p.id) }}>
                      <ExternalLink size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <div className={styles.pageButtons}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
