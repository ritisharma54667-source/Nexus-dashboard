import { useMemo } from 'react'
import { useProjectStore } from '../../store'
import { parseISO, differenceInDays, format, addMonths, startOfYear } from 'date-fns'
import styles from './TimelineView.module.css'

const YEAR_START = new Date(2025, 0, 1)
const YEAR_END   = new Date(2025, 11, 31)
const TOTAL_DAYS = differenceInDays(YEAR_END, YEAR_START) + 1
const TODAY      = new Date()

function pct(date) {
  const d = differenceInDays(date, YEAR_START)
  return Math.max(0, Math.min(100, (d / TOTAL_DAYS) * 100))
}

const STATUS_COLORS = {
  active:    '#3A75C4',
  'at-risk': '#EF4444',
  planning:  '#F97316',
  'on-hold': '#94A3B8',
  completed: '#22C55E',
}

export default function TimelineView() {
  const projects = useProjectStore((s) => s.projects)

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = addMonths(startOfYear(YEAR_START), i)
      return { label: format(d, 'MMM'), pct: pct(d) }
    })
  }, [])

  const todayPct = pct(TODAY)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Timeline</h2>
        <p className={styles.sub}>Full-year project schedule — 2025</p>
      </div>

      <div className={styles.ganttCard}>
        {/* Month header row */}
        <div className={styles.ganttRow}>
          <div className={styles.nameCol}>
            <span className={styles.colLabel}>Project</span>
          </div>
          <div className={styles.barCol}>
            {months.map((m) => (
              <div key={m.label} className={styles.monthTick} style={{ left: `${m.pct}%` }}>
                <span className={styles.monthLabel}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Project rows */}
        {projects.map((p) => {
          const s   = parseISO(p.startDate)
          const e   = parseISO(p.endDate)
          const lft = pct(s)
          const wid = Math.max(pct(e) - lft, 1)
          const color = STATUS_COLORS[p.status] ?? '#94A3B8'

          return (
            <div key={p.id} className={styles.ganttRow}>
              <div className={styles.nameCol}>
                <p className={styles.projName}>{p.name}</p>
                <p className={styles.projClient}>{p.client}</p>
              </div>

              <div className={styles.barCol}>
                {/* Month grid lines */}
                {months.map((m) => (
                  <div key={m.label} className={styles.gridLine} style={{ left: `${m.pct}%` }} />
                ))}

                {/* Today line */}
                <div className={styles.todayLine} style={{ left: `${todayPct}%` }} title="Today" />

                {/* Project bar */}
                <div
                  className={styles.bar}
                  style={{ left: `${lft}%`, width: `${wid}%`, background: color }}
                  title={`${p.name}  |  ${format(s,'MMM d')} → ${format(e,'MMM d')}  |  ${p.progress}% done`}
                >
                  {/* Progress overlay */}
                  <div
                    className={styles.barProgress}
                    style={{ width: `${p.progress}%` }}
                  />
                  {wid > 8 && (
                    <span className={styles.barText}>{p.progress}%</span>
                  )}

                  {/* Milestone diamonds */}
                  {p.milestones.map((m) => {
                    const mp = pct(parseISO(m.dueDate))
                    const rel = ((mp - lft) / wid) * 100
                    if (rel < 0 || rel > 100) return null
                    return (
                      <div
                        key={m.id}
                        className={styles.diamond}
                        style={{
                          left: `${rel}%`,
                          background:
                            m.status === 'completed' ? '#22C55E'
                            : m.status === 'overdue' ? '#EF4444'
                            : '#fff',
                        }}
                        title={`${m.title} — ${m.status}`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: c }} />
            {s.replace('-', ' ')}
          </span>
        ))}
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#22C55E', borderRadius: '2px', transform: 'rotate(45deg)', display: 'inline-block' }} />
          milestone done
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#EF4444', borderRadius: '2px', transform: 'rotate(45deg)', display: 'inline-block' }} />
          milestone overdue
        </span>
        <span className={styles.legendItem}>
          <span style={{ width: 2, height: 12, background: 'var(--accent)', display: 'inline-block', borderRadius: 1, verticalAlign: 'middle', marginRight: 4 }} />
          today
        </span>
      </div>
    </div>
  )
}
