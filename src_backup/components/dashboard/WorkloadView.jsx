import { useTeamStore, useProjectStore } from '../../store'
import { workloadColor } from '../../utils'
import styles from './WorkloadView.module.css'

export default function WorkloadView() {
  const members  = useTeamStore((s) => s.members)
  const projects = useProjectStore((s) => s.projects)

  const getMemberProjects = (memberId) =>
    projects.filter((p) => p.team.includes(memberId) && p.status !== 'completed')

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Team Workload</h2>
        <p className={styles.sub}>Current capacity utilization across all team members</p>
      </div>

      <div className={styles.grid}>
        {members.map((m) => {
          const mProjects = getMemberProjects(m.id)
          const color = workloadColor(m.workload)
          return (
            <div key={m.id} className={styles.card}>
              <div className={styles.memberHeader}>
                <div className={styles.avatar} style={{ background: m.color }}>{m.initials}</div>
                <div>
                  <p className={styles.name}>{m.name}</p>
                  <p className={styles.role}>{m.role}</p>
                </div>
                <div className={styles.workloadPct} style={{ color }}>{m.workload}%</div>
              </div>

              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${m.workload}%`, background: color }}
                />
                <div className={styles.barMarker} style={{ left: '80%' }} title="80% threshold" />
              </div>
              <p className={styles.barLabel} style={{ color }}>
                {m.workload >= 85 ? '🔴 Overloaded' : m.workload >= 70 ? '🟡 High Load' : '🟢 Balanced'}
              </p>

              {mProjects.length > 0 && (
                <div className={styles.projects}>
                  {mProjects.map((p) => (
                    <span key={p.id} className={styles.projectTag}>{p.name}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
