/**
 * mockData.js
 *
 * Realistic mock data for the Nexus Dashboard.
 * All dates use ISO strings. All IDs are stable strings.
 *
 * Data model documented in: src/context/PROJECT_CONTEXT.md
 *
 * Status as of the backend integration: PROJECTS, TEAM_MEMBERS,
 * ACTIVITIES, and STATUS_DISTRIBUTION below are no longer imported
 * anywhere — projects, team, and activity now come live from the API
 * (see hooks/useDashboardData). They're left in place as a reference
 * for the data shape and as a fallback dataset if you ever want to
 * demo the UI without a backend running. MONTHLY_BUDGET_DATA and
 * NOTIFICATIONS are still used (see server/README.md for why).
 */

export const TEAM_MEMBERS = [
  { id: 'u1', name: 'Pratik Sharma',  role: 'Engineering Lead', initials: 'PS', department: 'Engineering', workload: 87, color: '#3A75C4' },
  { id: 'u2', name: 'Anika Rao',      role: 'Product Manager',  initials: 'AR', department: 'Product',     workload: 62, color: '#8CA654' },
  { id: 'u3', name: 'Dev Mehta',      role: 'UI/UX Designer',   initials: 'DM', department: 'Design',      workload: 94, color: '#F97316' },
  { id: 'u4', name: 'Sneha Kapoor',   role: 'Backend Engineer', initials: 'SK', department: 'Engineering', workload: 45, color: '#8B5CF6' },
  { id: 'u5', name: 'Rohan Verma',    role: 'Data Analyst',     initials: 'RV', department: 'Analytics',   workload: 71, color: '#EF4444' },
  { id: 'u6', name: 'Meera Joshi',    role: 'QA Lead',          initials: 'MJ', department: 'QA',          workload: 58, color: '#22C55E' },
  { id: 'u7', name: 'Arjun Singh',    role: 'DevOps Engineer',  initials: 'AS', department: 'Ops',         workload: 33, color: '#F59E0B' },
  { id: 'u8', name: 'Pooja Nair',     role: 'Frontend Dev',     initials: 'PN', department: 'Engineering', workload: 79, color: '#06B6D4' },
]

export const PROJECTS = [
  {
    id: 'p1',
    name: 'E-Commerce Platform Relaunch',
    client: 'RetailCo India',
    status: 'active',
    progress: 68,
    healthScore: 74,
    priorityScore: 88,
    startDate: '2025-01-15',
    endDate: '2025-08-30',
    deadline: '2025-08-30',
    budget: { allocated: 1800000, spent: 1240000, currency: '₹' },
    priority: 'high',
    owner: 'u1',
    team: ['u1', 'u3', 'u4', 'u8'],
    tags: ['web', 'e-commerce', 'react'],
    description: 'Full relaunch of the retail platform with new checkout flow, mobile-first design, and performance improvements targeting sub-2s LCP.',
    milestones: [
      { id: 'm1', title: 'Design System Complete',   dueDate: '2025-03-01', status: 'completed', completedAt: '2025-02-28' },
      { id: 'm2', title: 'Backend APIs Stable',      dueDate: '2025-05-15', status: 'completed', completedAt: '2025-05-20' },
      { id: 'm3', title: 'Beta Launch',              dueDate: '2025-07-01', status: 'in-progress', completedAt: null },
      { id: 'm4', title: 'Production Go-Live',       dueDate: '2025-08-30', status: 'pending',  completedAt: null },
    ],
    risks: [
      { id: 'r1', title: 'Payment gateway integration delay', severity: 'high',   likelihood: 'medium', status: 'open',      owner: 'u4' },
      { id: 'r2', title: 'Third-party logistics API unstable', severity: 'medium', likelihood: 'high',   status: 'mitigated', owner: 'u1' },
    ],
  },
  {
    id: 'p2',
    name: 'Internal HR Analytics Suite',
    client: 'TechCorp HR',
    status: 'at-risk',
    progress: 41,
    healthScore: 38,
    priorityScore: 95,
    startDate: '2025-02-01',
    endDate: '2025-06-15',
    deadline: '2025-06-15',
    budget: { allocated: 950000, spent: 920000, currency: '₹' },
    priority: 'critical',
    owner: 'u2',
    team: ['u2', 'u5', 'u6'],
    tags: ['analytics', 'internal', 'charts'],
    description: 'Real-time HR dashboard aggregating headcount, attrition, performance, and payroll data from 5 disparate HRMS systems.',
    milestones: [
      { id: 'm5', title: 'Data Pipeline Setup',     dueDate: '2025-03-15', status: 'completed',   completedAt: '2025-03-18' },
      { id: 'm6', title: 'Dashboard V1',            dueDate: '2025-04-30', status: 'completed',   completedAt: '2025-05-10' },
      { id: 'm7', title: 'Reporting Module',        dueDate: '2025-05-30', status: 'overdue',     completedAt: null },
      { id: 'm8', title: 'UAT & Handoff',           dueDate: '2025-06-15', status: 'pending',     completedAt: null },
    ],
    risks: [
      { id: 'r3', title: 'Budget nearly exhausted at 41% completion', severity: 'critical', likelihood: 'high', status: 'open', owner: 'u2' },
      { id: 'r4', title: 'Key stakeholder unavailable for UAT',       severity: 'high',     likelihood: 'medium', status: 'open', owner: 'u6' },
      { id: 'r5', title: 'Data quality issues in legacy HRMS',        severity: 'medium',   likelihood: 'high', status: 'open', owner: 'u5' },
    ],
  },
  {
    id: 'p3',
    name: 'Mobile Banking App v3',
    client: 'FinanceBank',
    status: 'active',
    progress: 82,
    healthScore: 91,
    priorityScore: 55,
    startDate: '2024-11-01',
    endDate: '2025-07-31',
    deadline: '2025-07-31',
    budget: { allocated: 3200000, spent: 2450000, currency: '₹' },
    priority: 'high',
    owner: 'u4',
    team: ['u1', 'u4', 'u7', 'u8'],
    tags: ['mobile', 'fintech', 'react-native'],
    description: 'Native banking experience with biometric auth, UPI 2.0, investment tracking, and an AI-powered spend categorization engine.',
    milestones: [
      { id: 'm9',  title: 'Auth & Onboarding',      dueDate: '2025-01-30', status: 'completed', completedAt: '2025-01-28' },
      { id: 'm10', title: 'Core Banking Features',  dueDate: '2025-04-15', status: 'completed', completedAt: '2025-04-12' },
      { id: 'm11', title: 'Investment Module',      dueDate: '2025-06-30', status: 'completed', completedAt: '2025-06-25' },
      { id: 'm12', title: 'App Store Submission',   dueDate: '2025-07-31', status: 'in-progress', completedAt: null },
    ],
    risks: [
      { id: 'r6', title: 'App Store review delays', severity: 'medium', likelihood: 'medium', status: 'open', owner: 'u7' },
    ],
  },
  {
    id: 'p4',
    name: 'Supply Chain Visibility Platform',
    client: 'LogisCo',
    status: 'planning',
    progress: 12,
    healthScore: 82,
    priorityScore: 42,
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    deadline: '2025-12-31',
    budget: { allocated: 4500000, spent: 180000, currency: '₹' },
    priority: 'medium',
    owner: 'u2',
    team: ['u2', 'u3', 'u5'],
    tags: ['logistics', 'maps', 'real-time'],
    description: 'End-to-end supply chain visibility with live shipment tracking, ETA predictions, exception management, and supplier scorecards.',
    milestones: [
      { id: 'm13', title: 'Requirements Finalized', dueDate: '2025-06-30', status: 'completed',   completedAt: '2025-06-28' },
      { id: 'm14', title: 'Architecture Review',    dueDate: '2025-07-15', status: 'in-progress', completedAt: null },
      { id: 'm15', title: 'Prototype Demo',         dueDate: '2025-09-01', status: 'pending',     completedAt: null },
      { id: 'm16', title: 'Production Launch',      dueDate: '2025-12-31', status: 'pending',     completedAt: null },
    ],
    risks: [],
  },
  {
    id: 'p5',
    name: 'AI Content Moderation API',
    client: 'SocialStream',
    status: 'on-hold',
    progress: 55,
    healthScore: 52,
    priorityScore: 67,
    startDate: '2025-03-01',
    endDate: '2025-09-30',
    deadline: '2025-09-30',
    budget: { allocated: 2100000, spent: 1150000, currency: '₹' },
    priority: 'medium',
    owner: 'u5',
    team: ['u5', 'u6', 'u7'],
    tags: ['ai', 'api', 'nlp'],
    description: 'Multi-modal AI API for real-time content moderation covering text, images, and video across 12 languages with <50ms response time.',
    milestones: [
      { id: 'm17', title: 'Model Training V1',      dueDate: '2025-04-30', status: 'completed', completedAt: '2025-04-25' },
      { id: 'm18', title: 'API Gateway Setup',      dueDate: '2025-05-31', status: 'completed', completedAt: '2025-05-30' },
      { id: 'm19', title: 'Image Moderation Module',dueDate: '2025-07-15', status: 'on-hold',   completedAt: null },
      { id: 'm20', title: 'Client Integration',     dueDate: '2025-09-30', status: 'pending',   completedAt: null },
    ],
    risks: [
      { id: 'r7', title: 'Client paused scope pending budget approval', severity: 'high', likelihood: 'high', status: 'open', owner: 'u5' },
    ],
  },
  {
    id: 'p6',
    name: 'Healthcare Patient Portal',
    client: 'MediCare Systems',
    status: 'completed',
    progress: 100,
    healthScore: 95,
    priorityScore: 10,
    startDate: '2024-08-01',
    endDate: '2025-02-28',
    deadline: '2025-02-28',
    budget: { allocated: 2800000, spent: 2650000, currency: '₹' },
    priority: 'low',
    owner: 'u1',
    team: ['u1', 'u2', 'u3', 'u6', 'u8'],
    tags: ['healthcare', 'portal', 'HIPAA'],
    description: 'ABDM-compliant patient portal with appointment booking, lab results, prescription history, doctor video consultations, and family health profiles.',
    milestones: [
      { id: 'm21', title: 'ABDM Integration',       dueDate: '2024-11-15', status: 'completed', completedAt: '2024-11-10' },
      { id: 'm22', title: 'Video Consult Module',   dueDate: '2025-01-15', status: 'completed', completedAt: '2025-01-12' },
      { id: 'm23', title: 'UAT Sign-off',           dueDate: '2025-02-15', status: 'completed', completedAt: '2025-02-14' },
      { id: 'm24', title: 'Go Live',                dueDate: '2025-02-28', status: 'completed', completedAt: '2025-02-27' },
    ],
    risks: [],
  },
]

export const ACTIVITIES = [
  { id: 'a1', projectId: 'p2', userId: 'u2', type: 'risk_added',        message: 'Added critical risk: Budget nearly exhausted',          timestamp: '2025-06-27T09:14:00Z' },
  { id: 'a2', projectId: 'p1', userId: 'u4', type: 'milestone_complete', message: 'Completed milestone: Backend APIs Stable',              timestamp: '2025-06-26T16:30:00Z' },
  { id: 'a3', projectId: 'p3', userId: 'u8', type: 'status_change',     message: 'Investment Module marked complete — ahead of schedule', timestamp: '2025-06-25T11:00:00Z' },
  { id: 'a4', projectId: 'p5', userId: 'u5', type: 'status_change',     message: 'Project moved to On Hold pending client decision',      timestamp: '2025-06-24T14:22:00Z' },
  { id: 'a5', projectId: 'p4', userId: 'u2', type: 'comment',           message: 'Architecture review scheduled for July 10th',           timestamp: '2025-06-23T10:05:00Z' },
  { id: 'a6', projectId: 'p1', userId: 'u3', type: 'budget_update',     message: 'Updated budget forecast: on track within 5% variance',  timestamp: '2025-06-22T15:45:00Z' },
  { id: 'a7', projectId: 'p2', userId: 'u6', type: 'risk_added',        message: 'Added risk: Key stakeholder unavailable for UAT',       timestamp: '2025-06-21T08:30:00Z' },
  { id: 'a8', projectId: 'p6', userId: 'u1', type: 'milestone_complete', message: 'Go Live completed — project delivered on time!',       timestamp: '2025-02-27T18:00:00Z' },
]

export const NOTIFICATIONS = [
  { id: 'n1', type: 'danger',  title: 'Project At Risk',        message: 'HR Analytics Suite is critically over budget',    read: false, createdAt: '2025-06-27T09:14:00Z', projectId: 'p2' },
  { id: 'n2', type: 'warning', title: 'Milestone Overdue',      message: 'Reporting Module is 4 days overdue',              read: false, createdAt: '2025-06-26T08:00:00Z', projectId: 'p2' },
  { id: 'n3', type: 'info',    title: 'Milestone Complete',     message: 'Investment Module done — FinanceBank',            read: false, createdAt: '2025-06-25T11:00:00Z', projectId: 'p3' },
  { id: 'n4', type: 'warning', title: 'Project On Hold',        message: 'AI Content Moderation paused by client',         read: true,  createdAt: '2025-06-24T14:22:00Z', projectId: 'p5' },
  { id: 'n5', type: 'success', title: 'Project Delivered',      message: 'Healthcare Portal successfully launched!',        read: true,  createdAt: '2025-02-27T18:00:00Z', projectId: 'p6' },
]

export const MONTHLY_BUDGET_DATA = [
  { month: 'Jan', allocated: 850000,  spent: 720000  },
  { month: 'Feb', allocated: 920000,  spent: 880000  },
  { month: 'Mar', allocated: 1100000, spent: 950000  },
  { month: 'Apr', allocated: 1050000, spent: 1120000 },
  { month: 'May', allocated: 980000,  spent: 1050000 },
  { month: 'Jun', allocated: 1200000, spent: 940000  },
]

export const STATUS_DISTRIBUTION = [
  { name: 'Active',    value: 2, color: '#3A75C4' },
  { name: 'At Risk',   value: 1, color: '#EF4444' },
  { name: 'Planning',  value: 1, color: '#F97316' },
  { name: 'On Hold',   value: 1, color: '#94A3B8' },
  { name: 'Completed', value: 1, color: '#22C55E' },
]
