# NEXUS DASHBOARD — Project Context & Soul Document

## What This Product Is
Nexus is a **Project Portfolio Dashboard** built for agencies, product teams,
and operations managers who need a single command center to track everything
that matters: projects, people, budgets, risks, and deadlines.

It is NOT a task manager. It is NOT a simple todo list.
It is an **intelligence layer** over an entire portfolio of work.

---

## Who Uses This
| Role           | Primary Need                                        |
|----------------|-----------------------------------------------------|
| Agency Director| Portfolio health at a glance, client risk signals   |
| Product Manager| Sprint/milestone tracking, team load balancing      |
| Operations Lead| Budget burn, deadline adherence, resource conflicts |
| Team Member    | My tasks, my deadlines, where I'm blocked           |

---

## Core Data Model

### Project
- id, name, client, status (active|planning|on-hold|completed|at-risk)
- progress (0–100%), health score (0–100, composite)
- startDate, endDate, deadline
- budget { allocated, spent, currency }
- priority (critical|high|medium|low)
- owner (userId), team (userId[])
- milestones[], risks[], tags[]
- description, notes

### Milestone
- id, projectId, title, dueDate, status, completedAt

### Risk
- id, projectId, title, severity (critical|high|medium|low)
- likelihood (high|medium|low), status (open|mitigated|closed)
- owner, description, createdAt

### TeamMember
- id, name, role, avatar, department
- workload (0–100%), projects (projectId[])
- skills[], availability

### Activity
- id, projectId, userId, type, message, timestamp
- types: status_change | comment | milestone_complete | risk_added | budget_update

### Notification
- id, type, title, message, read, createdAt, link

---

## Health Score Algorithm
Health = weighted average of:
- Progress vs time elapsed  (40%)
- Budget utilization ratio  (30%)
- Open critical risks count (20%)
- Milestone completion rate (10%)

Score 80–100 → green (healthy)
Score 60–79  → yellow (needs attention)
Score 0–59   → red (at risk)

---

## Priority Score Algorithm
Auto-priority = f(deadline proximity, budget overrun, blocked milestones, risk count)
Higher score = more urgent attention needed from the PM.

---

## UI Rules (Never Break These)
1. Dark theme is the ONLY theme. Background #060C14. No light mode toggle.
2. One accent color does the heavy lifting: #3A75C4 (blue).
3. Secondary accent #8CA654 (sage green) for success states only.
4. Every number displayed must have context (%, currency symbol, label).
5. Empty states must guide the user toward an action, never just say "No data."
6. Loading states use skeleton screens, never spinners for main content.
7. Destructive actions require a confirmation step.
8. All dates display relative ("3 days overdue") + absolute on hover.
9. Risk indicators must be visible without requiring hover.
10. Mobile: sidebar collapses to bottom nav. Nothing gets hidden.

---

## Feature Inventory
| Feature              | Purpose                                         | Status   |
|----------------------|-------------------------------------------------|----------|
| KPI Cards            | Top-line portfolio metrics at a glance          | core     |
| Project Table        | Sortable, filterable list of all projects       | core     |
| Detail Drawer        | Deep-dive on one project without leaving page   | core     |
| Risk Radar           | Surface blocked/overdue projects automatically  | core     |
| Health Score         | Composite score per project                     | core     |
| Timeline View        | Lightweight Gantt for deadlines and milestones  | core     |
| Workload Heatmap     | Who is overloaded across the team               | core     |
| Activity Stream      | Social-feed of recent changes                   | core     |
| Command Palette      | ⌘K quick navigation and actions                 | core     |
| Smart Filters        | "Late only", "Over budget", "Needs review"      | core     |
| Insights Panel       | Auto-generated warnings: "3 projects at risk"   | enhanced |
| Role-based Views     | Manager / Member / Admin perspectives           | enhanced |

---

## State Management (Zustand)
- useProjectStore   → projects, filters, selected project
- useUIStore        → sidebar state, modal state, command palette
- useNotifStore     → notifications, unread count
- useUserStore      → current user, role, preferences

---

## Routing
/ → Dashboard (overview)
/projects → All Projects table
/projects/:id → Project detail (or use drawer on dashboard)
/timeline → Gantt-style timeline
/team → Workload heatmap
/budget → Budget analysis
/reports → Export and analytics
/settings → App settings

---

## Engineering Rules
1. Components are single-responsibility. One job per file.
2. No business logic inside JSX. Extract to hooks or utils.
3. CSS Modules for all component styles. No global class soup.
4. Zustand stores are flat. No nested state objects deeper than 2 levels.
5. All mock data lives in src/data/. Never hardcode data in components.
6. Date math uses date-fns only. Never native Date arithmetic inline.
7. Chart data is always derived in a useMemo, never computed in render.
8. Recharts only. No other chart library.
9. All icons from lucide-react. No SVG files for icons.
10. README must stay updated. It is part of the product.

---

## What Makes This Portfolio-Worthy
- Real data model (not "name + status" toy data)
- Real algorithms (health score, priority score)
- Real UX patterns (command palette, skeleton loading, empty states)
- Real engineering (Zustand, CSS Modules, component architecture)
- Real product thinking (who uses this, why, what decisions it enables)

This is the difference between a template and a product.
