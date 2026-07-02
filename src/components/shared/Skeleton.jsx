import styles from './Skeleton.module.css'

export function SkeletonCard() {
  return <div className={styles.card} />
}

export function SkeletonKPIGrid() {
  return (
    <div className={styles.kpiGrid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.kpiCard}>
          <div className={styles.iconBox} />
          <div className={styles.lines}>
            <div className={`${styles.line} ${styles.lineShort}`} />
            <div className={`${styles.line} ${styles.lineMed}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className={styles.tableSkeleton}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.tableRow}>
          <div className={styles.avatarSkel} />
          <div className={styles.lines} style={{ flex: 1 }}>
            <div className={`${styles.line} ${styles.lineMed}`} />
            <div className={`${styles.line} ${styles.lineShort}`} />
          </div>
          <div className={`${styles.line} ${styles.lineShort}`} />
        </div>
      ))}
    </div>
  )
}
