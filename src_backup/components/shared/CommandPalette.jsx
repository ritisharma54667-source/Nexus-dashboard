import { useEffect, useRef, useState } from 'react'
import { Search, FolderKanban, LayoutDashboard, Users, GitBranch, Wallet, BarChart3, AlertTriangle } from 'lucide-react'
import { useUIStore, useProjectStore } from '../../store'
import styles from './CommandPalette.module.css'

const COMMANDS = [
  { id: 'dashboard',  label: 'Go to Dashboard',        icon: LayoutDashboard, action: 'view', view: 'dashboard' },
  { id: 'projects',   label: 'Go to Projects',         icon: FolderKanban,   action: 'view', view: 'projects' },
  { id: 'timeline',   label: 'Go to Timeline',         icon: GitBranch,      action: 'view', view: 'timeline' },
  { id: 'team',       label: 'Go to Team Workload',    icon: Users,          action: 'view', view: 'team' },
  { id: 'budget',     label: 'Go to Budget',           icon: Wallet,         action: 'view', view: 'budget' },
  { id: 'reports',    label: 'Go to Reports',          icon: BarChart3,      action: 'view', view: 'reports' },
  { id: 'filter-risk',label: 'Filter: At Risk Projects',icon: AlertTriangle, action: 'filter', filter: 'late' },
  { id: 'filter-budget',label:'Filter: Over Budget',   icon: AlertTriangle,  action: 'filter', filter: 'over-budget' },
]

export default function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, setView } = useUIStore()
  const { projects, selectProject, setFilter } = useProjectStore()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        commandPaletteOpen ? closeCommandPalette() : useUIStore.getState().openCommandPalette()
      }
      if (e.key === 'Escape') closeCommandPalette()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, closeCommandPalette])

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setActiveIdx(0)
    }
  }, [commandPaletteOpen])

  if (!commandPaletteOpen) return null

  const projectResults = query.length > 0
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.client.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : []

  const commandResults = COMMANDS.filter((c) =>
    query.length === 0 || c.label.toLowerCase().includes(query.toLowerCase())
  )

  const allResults = [
    ...projectResults.map((p) => ({ id: p.id, label: p.name, sub: p.client, icon: FolderKanban, action: 'project', projectId: p.id })),
    ...commandResults,
  ]

  const handleSelect = (item) => {
    if (item.action === 'view')    { setView(item.view); closeCommandPalette() }
    if (item.action === 'project') { selectProject(item.projectId); closeCommandPalette() }
    if (item.action === 'filter')  { setFilter('smart', item.filter); setView('projects'); closeCommandPalette() }
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allResults.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && allResults[activeIdx]) handleSelect(allResults[activeIdx])
  }

  return (
    <>
      <div className={styles.overlay} onClick={closeCommandPalette} />
      <div className={styles.palette}>
        <div className={styles.searchRow}>
          <Search size={15} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search projects, navigate, or run a command…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0) }}
            onKeyDown={handleKey}
          />
          <kbd className={styles.esc}>esc</kbd>
        </div>

        <div className={styles.results}>
          {allResults.length === 0 && (
            <p className={styles.empty}>No results for "{query}"</p>
          )}
          {projectResults.length > 0 && (
            <p className={styles.groupLabel}>Projects</p>
          )}
          {allResults.map((item, idx) => {
            const Icon = item.icon
            const isCmd = idx >= projectResults.length && projectResults.length > 0
            const showLabel = idx === projectResults.length && projectResults.length > 0
            return (
              <div key={item.id} className={styles.resultGroup}>
                {showLabel && <p className={styles.groupLabel}>Commands</p>}
                <button
                  className={`${styles.result} ${idx === activeIdx ? styles.active : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  <div className={styles.resultIcon}><Icon size={15} /></div>
                  <div>
                    <p className={styles.resultLabel}>{item.label}</p>
                    {item.sub && <p className={styles.resultSub}>{item.sub}</p>}
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <div className={styles.footer}>
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </>
  )
}
