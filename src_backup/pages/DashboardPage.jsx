import { useEffect, useState } from 'react'
import KPICards from '../components/dashboard/KPICards'
import ChartsArea from '../components/dashboard/ChartsArea'
import Insights from '../components/dashboard/Insights'
import { SkeletonKPIGrid, SkeletonCard } from '../components/shared/Skeleton'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SkeletonKPIGrid />
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <KPICards />
      <ChartsArea />
      <Insights />
    </div>
  )
}
