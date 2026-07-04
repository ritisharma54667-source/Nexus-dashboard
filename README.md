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

## Auth Now Has a Real Backend

This project used to run on a mock, hardcoded auth flow. It now talks to a real Node/Express + PostgreSQL API in `/server` with JWT access tokens, httpOnly refresh-token rotation, signup, login, forgot password (emailed link), and reset password. See **[Getting Started](#getting-started)** below to spin up both halves, and `server/README.md` for the API itself.

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
- Real backend: Node/Express + PostgreSQL, JWT access tokens + httpOnly refresh-token rotation (see `/server`)
- Sign up, log in, forgot password (emailed reset link), reset password — all backed by the API, not mocked
- Access token lives in memory only (never localStorage); refreshed silently and transparently on expiry
- Inline validation, show/hide password, loading/error states throughout
- Route protection — unauthenticated users only ever see the login/signup/forgot/reset screens
- Logout from Settings page, clears the server-side refresh cookie

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
| Backend    | Node + Express | See `/server` |
| Database   | PostgreSQL     | Users + password reset tokens |
| Auth       | JWT (jsonwebtoken) + bcryptjs | Access token in memory, refresh token as httpOnly cookie |

---

## Structure

```
nexus-dashboard/
├── server/                    ← Express + PostgreSQL API (see server/README.md)
│   └── src/
│       ├── db/                ← pool.js, schema.sql, setup.js
│       ├── controllers/       ← auth.controller.js
│       ├── middleware/        ← auth.js, rateLimiter.js, errorHandler.js
│       ├── routes/            ← auth.routes.js
│       └── utils/             ← tokens.js, mailer.js, validators.js
└── src/                       ← Frontend (this folder)
    ├── context/
    │   ├── PROJECT_CONTEXT.md   ← Product soul document — read this first
    │   ├── AppContext.jsx        ← Current user, role, permissions
    │   └── AuthContext.jsx       ← Real auth state machine (calls the API)
    ├── store/index.js            ← Zustand stores (project / UI / notif / team)
    ├── data/mockData.js          ← Single source of truth for portfolio/project data
    ├── utils/
    │   ├── index.js              ← Pure utilities: dates, currency, status meta
    │   └── api.js                ← Fetch wrapper, silent token refresh
    ├── styles/globals.css        ← Design tokens (CSS vars) + reset
    ├── components/
    │   ├── layout/               ← Sidebar (+ mobile bottom nav), TopBar
    │   ├── dashboard/            ← KPIs, Charts, Insights, Timeline, Workload, Budget, Reports, Settings
    │   ├── projects/             ← ProjectTable, ProjectDrawer
    │   └── shared/               ← CommandPalette, NotificationPanel, Skeleton
    ├── pages/                    ← LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, DashboardPage, ProjectsPage
    └── App.jsx                   ← Auth gate → login/signup/forgot/reset → layout → view router
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

This is now a two-part project: the Express/PostgreSQL API in `server/`, and this Vite/React frontend. You need Postgres running (local install, or a free hosted one like Neon) before the app can log anyone in.

**1. Backend**
```bash
cd server
npm install
cp .env.example .env        # then fill in DATABASE_URL and the two JWT secrets
npm run db:setup            # creates the users + password_reset_tokens tables
npm run dev                 # → http://localhost:4000
```

**2. Frontend** (in a second terminal, from the project root)
```bash
npm install
cp .env.example .env        # VITE_API_URL should point at the backend, e.g. http://localhost:4000/api
npm run dev                 # → http://localhost:5173
```

Open http://localhost:5173, click **Create one**, and sign up — there's no seeded demo account anymore since accounts are real. If you request a password reset without SMTP configured in `server/.env`, the reset link is printed straight to the backend's terminal instead of emailed, so you can still test the full flow locally.

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
