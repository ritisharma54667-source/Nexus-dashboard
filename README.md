# Nexus — Project Portfolio Dashboard

> A premium dark-mode SaaS dashboard for agencies and product teams who need one command center to track every project, deadline, budget, and risk across their portfolio.

![React](https://img.shields.io/badge/React-18-3A75C4?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-F97316?style=flat-square&logo=vite)
![Zustand](https://img.shields.io/badge/Zustand-5-8CA654?style=flat-square)
![CSS Modules](https://img.shields.io/badge/CSS-Modules-blue?style=flat-square)

---

## What This Is

Nexus is not a template. It is a **real product** — built with the same engineering decisions you'd find in internal SaaS tools at product companies. Every feature solves a real problem. Every component has a single clear responsibility.

**Who it's for:** Agency directors, product managers, and operations leads who oversee multiple projects simultaneously and need at-a-glance visibility into health, risk, budget, and people.

---

## Demo Credentials

```
Email:    demo@nexus.io
Password: nexus2025
```

---

## Features

### Dashboard
- **KPI Cards** — 6 real-time portfolio metrics (active, at-risk, budget %, overloaded team, completed, avg health)
- **Budget Trend** — Area chart: allocated vs actual spend per month
- **Portfolio Status** — Donut chart distribution across statuses
- **Risk Radar** — Auto-sorted health bars for every active project
- **Insights Panel** — Auto-generated alerts: at-risk projects, budget warnings, overdue milestones
- **Activity Stream** — Social-feed of portfolio events with type icons and relative timestamps

### Projects
- **Sortable Table** — Any column: priority score, health, progress, budget, deadline
- **Smart Filters** — "Late / At Risk", "Over Budget", "Open Risks" — one click
- **Search** — Live search across name and client
- **Pagination** — 5 per page
- **Detail Drawer** — Slide-in panel: milestones, risks, team workload, health ring, timeline, budget

### Power Features
- **Command Palette** (`⌘K`) — Navigate, search projects, apply filters without a mouse
- **Timeline View** — Gantt-style schedule with milestone dots and Today marker
- **Team Workload** — Per-member capacity cards (balanced / high / overloaded)
- **Budget Analysis** — Per-project bar chart + utilization table with over-budget flags
- **Reports** — Portfolio summary + CSV export
- **Notifications** — Unread badge, type-coded panel, mark-all-read

### Auth
- Session-based auth flow with loading/error states, inline validation, show/hide password
- Route protection — unauthenticated users see login only
- 8-hour session expiry with live countdown in Settings
- Logout from Settings page

---

## Stack

| Layer      | Choice         | Reason |
|------------|----------------|--------|
| Framework  | React 18 + Vite 6 | Fast DX, modern bundler |
| State      | Zustand 5      | Flat, minimal, no boilerplate |
| Charts     | Recharts       | Composable, React-native |
| Dates      | date-fns       | Functional, tree-shakeable |
| Icons      | lucide-react   | Consistent 1px strokes |
| Styles     | CSS Modules    | Scoped, zero runtime, no collisions |

---

## Structure

```
src/
├── context/
│   ├── PROJECT_CONTEXT.md   ← Product soul document — read this first
│   ├── AppContext.jsx        ← User, role, permissions
│   └── AuthContext.jsx       ← Auth state machine + session
├── store/index.js            ← Zustand stores (project / UI / notif / team)
├── data/mockData.js          ← Single source of truth for all data
├── utils/index.js            ← Pure utilities: dates, currency, status meta
├── styles/globals.css        ← Design tokens (CSS vars) + reset
├── components/
│   ├── layout/               ← Sidebar, TopBar
│   ├── dashboard/            ← KPIs, Charts, Insights, Timeline, Workload, Budget, Reports, Settings
│   ├── projects/             ← ProjectTable, ProjectDrawer
│   └── shared/               ← CommandPalette, NotificationPanel, Skeleton
├── pages/                    ← LoginPage, DashboardPage, ProjectsPage
└── App.jsx                   ← Auth gate → layout → view router
```

---

## Health Score Formula

```
Health = (progress_vs_time × 0.4) + (budget_ratio × 0.3) + (risk_penalty × 0.2) + (milestone_rate × 0.1)

80–100 → Healthy  |  60–79 → Needs Attention  |  0–59 → At Risk
```

Full data model, algorithms, UI rules, and engineering constraints documented in `src/context/PROJECT_CONTEXT.md`.

---

## Getting Started

```bash
git clone https://github.com/yourusername/nexus-dashboard
cd nexus-dashboard
npm install
npm run dev        # → http://localhost:5173
```

## Build + Deploy

```bash
npm run build      # → dist/

# Vercel (recommended)
npx vercel

# Netlify — drag dist/ into netlify.app
```

---

## Why This Is Portfolio-Worthy

Most dashboard demos: table + two charts + done.

Nexus demonstrates:
1. **Product thinking** — `PROJECT_CONTEXT.md` has user personas, algorithms, data model, UI rules
2. **Real data model** — nested milestones, risks, team, budget (not just `name + status`)
3. **Real algorithms** — health score, priority score, workload calculation
4. **Real UX patterns** — command palette, skeleton loading, drawer animation, smart filters, empty states
5. **Real engineering** — CSS Modules, Zustand selectors, single-responsibility components, no logic in JSX
6. **Real auth** — state machine, validation, loading/error states, route protection, session expiry
7. **Real docs** — README explains *why*, not just *what*

---

*React + Vite · Dark mode only · MIT License*
