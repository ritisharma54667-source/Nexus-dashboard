import { useState } from 'react'
import ProjectTable from '../components/projects/ProjectTable'
import ProjectDrawer from '../components/projects/ProjectDrawer'
import ProjectFormModal from '../components/projects/ProjectFormModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { useProjectStore } from '../store'
import { useProjectActions } from '../hooks'

export default function ProjectsPage() {
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId)
  const clearSelection = useProjectStore((s) => s.clearSelection)
  const { createProject, updateProject, archiveProject, unarchiveProject, deleteProject } = useProjectActions()

  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null) // project object, or null for "create"
  const [pendingDelete, setPendingDelete] = useState(null)   // project object

  const openCreate = () => { setEditingProject(null); setFormOpen(true) }
  const openEdit   = (project) => { setEditingProject(project); setFormOpen(true) }

  const handleSubmit = (input) =>
    editingProject ? updateProject(editingProject.id, input) : createProject(input)

  const handleArchiveToggle = async (project) => {
    if (project.status === 'archived') await unarchiveProject(project.id)
    else await archiveProject(project.id)
  }

  const handleDeleteConfirmed = async () => {
    await deleteProject(pendingDelete.id)
    setPendingDelete(null)
    if (selectedProjectId === pendingDelete.id) clearSelection()
  }

  return (
    <>
      <ProjectTable onAddProject={openCreate} />

      {selectedProjectId && (
        <ProjectDrawer
          onEdit={openEdit}
          onArchiveToggle={handleArchiveToggle}
          onDelete={(project) => setPendingDelete(project)}
        />
      )}

      {formOpen && (
        <ProjectFormModal
          project={editingProject}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this project?"
          message={`"${pendingDelete.name}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
