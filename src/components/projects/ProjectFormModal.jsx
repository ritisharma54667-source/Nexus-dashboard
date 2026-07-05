import { useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { useTeamStore } from '../../store'
import { STATUS_META, PRIORITY_META } from '../../utils'
import styles from './ProjectFormModal.module.css'

const STATUSES = Object.keys(STATUS_META)
const PRIORITIES = Object.keys(PRIORITY_META)

function emptyForm() {
  return {
    name: '',
    client: '',
    status: 'planning',
    priority: 'medium',
    progress: 0,
    healthScore: 100,
    startDate: '',
    endDate: '',
    budgetAllocated: '',
    budgetSpent: '',
    tags: '',
    description: '',
    team: [],
  }
}

function projectToForm(p) {
  return {
    name: p.name,
    client: p.client || '',
    status: p.status,
    priority: p.priority,
    progress: p.progress,
    healthScore: p.healthScore,
    startDate: p.startDate || '',
    endDate: p.endDate || '',
    budgetAllocated: p.budget.allocated ?? '',
    budgetSpent: p.budget.spent ?? '',
    tags: (p.tags || []).join(', '),
    description: p.description || '',
    team: p.team || [],
  }
}

// Shared by "Create Project" (ProjectTable toolbar) and "Edit Project"
// (ProjectDrawer) — same fields either way, just a different submit action.
export default function ProjectFormModal({ project, onSubmit, onClose }) {
  const members = useTeamStore((s) => s.members)
  const [form, setForm] = useState(() => (project ? projectToForm(project) : emptyForm()))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = Boolean(project)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleTeamMember = (id) => {
    setForm((f) => ({
      ...f,
      team: f.team.includes(id) ? f.team.filter((t) => t !== id) : [...f.team, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      setError('Project name must be at least 2 characters.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        client: form.client.trim(),
        status: form.status,
        priority: form.priority,
        progress: Number(form.progress) || 0,
        healthScore: Number(form.healthScore) || 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        budget: {
          allocated: Number(form.budgetAllocated) || 0,
          spent: Number(form.budgetSpent) || 0,
        },
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        description: form.description,
        team: form.team,
      })
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{isEdit ? 'Edit Project' : 'New Project'}</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Project name</span>
              <input value={form.name} onChange={set('name')} placeholder="E-Commerce Relaunch" autoFocus />
            </label>
            <label className={styles.field}>
              <span>Client</span>
              <input value={form.client} onChange={set('client')} placeholder="Acme Co" />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Status</span>
              <select value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Priority</span>
              <select value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
              </select>
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Start date</span>
              <input type="date" value={form.startDate || ''} onChange={set('startDate')} />
            </label>
            <label className={styles.field}>
              <span>Deadline</span>
              <input type="date" value={form.endDate || ''} onChange={set('endDate')} />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Progress (%)</span>
              <input type="number" min="0" max="100" value={form.progress} onChange={set('progress')} />
            </label>
            <label className={styles.field}>
              <span>Health score</span>
              <input type="number" min="0" max="100" value={form.healthScore} onChange={set('healthScore')} />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Budget allocated (₹)</span>
              <input type="number" min="0" value={form.budgetAllocated} onChange={set('budgetAllocated')} />
            </label>
            <label className={styles.field}>
              <span>Budget spent (₹)</span>
              <input type="number" min="0" value={form.budgetSpent} onChange={set('budgetSpent')} />
            </label>
          </div>

          <label className={styles.field}>
            <span>Tags (comma-separated)</span>
            <input value={form.tags} onChange={set('tags')} placeholder="web, react, urgent" />
          </label>

          {members.length > 0 && (
            <div className={styles.field}>
              <span>Team</span>
              <div className={styles.teamPicker}>
                {members.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className={`${styles.teamChip} ${form.team.includes(m.id) ? styles.teamChipActive : ''}`}
                    onClick={() => toggleTeamMember(m.id)}
                  >
                    <span className={styles.teamChipDot} style={{ background: m.color }} />
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className={styles.field}>
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder="What's this project about?" />
          </label>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? <><Loader2 size={14} className={styles.spinner} /> Saving…</> : isEdit ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
