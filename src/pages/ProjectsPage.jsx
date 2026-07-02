import ProjectTable from '../components/projects/ProjectTable'
import ProjectDrawer from '../components/projects/ProjectDrawer'
import { useProjectStore } from '../store'

export default function ProjectsPage() {
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId)

  return (
    <>
      <ProjectTable />
      {selectedProjectId && <ProjectDrawer />}
    </>
  )
}
