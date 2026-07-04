/**
 * utils/index.js — Pure utility functions for Nexus Dashboard.
 * All date operations use date-fns. No native Date arithmetic.
 */

import { formatDistanceToNow, format, isPast, parseISO, differenceInDays } from 'date-fns'

// ─── Date Utilities ──────────────────────────────────────────────────
export const relativeDate = (iso) => {
  try { return formatDistanceToNow(parseISO(iso), { addSuffix: true }) }
  catch { return iso }
}

export const absDate = (iso) => {
  try { return format(parseISO(iso), 'MMM d, yyyy') }
  catch { return iso }
}

export const isOverdue = (iso) => {
  try { return isPast(parseISO(iso)) }
  catch { return false }
}

export const daysUntil = (iso) => {
  try { return differenceInDays(parseISO(iso), new Date()) }
  catch { return null }
}

// ─── Number Utilities ────────────────────────────────────────────────
export const formatCurrency = (amount, currency = '₹') => {
  if (amount >= 10000000) return `${currency}${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000)   return `${currency}${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000)     return `${currency}${(amount / 1000).toFixed(0)}K`
  return `${currency}${amount}`
}

export const pct = (n, total) => total > 0 ? Math.round((n / total) * 100) : 0

// ─── Health Score Utilities ──────────────────────────────────────────
export const healthColor = (score) => {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#F97316'
  return '#EF4444'
}

export const healthLabel = (score) => {
  if (score >= 80) return 'Healthy'
  if (score >= 60) return 'Attention'
  return 'At Risk'
}

// ─── Status Utilities ────────────────────────────────────────────────
export const STATUS_META = {
  active:     { label: 'Active',     color: '#3A75C4', bg: 'rgba(58,117,196,0.15)' },
  planning:   { label: 'Planning',   color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  'on-hold':  { label: 'On Hold',    color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
  completed:  { label: 'Completed',  color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  'at-risk':  { label: 'At Risk',    color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
}

export const PRIORITY_META = {
  critical: { label: 'Critical', color: '#EF4444' },
  high:     { label: 'High',     color: '#F97316' },
  medium:   { label: 'Medium',   color: '#F59E0B' },
  low:      { label: 'Low',      color: '#94A3B8' },
}

export const SEVERITY_META = {
  critical: { label: 'Critical', color: '#EF4444' },
  high:     { label: 'High',     color: '#F97316' },
  medium:   { label: 'Medium',   color: '#F59E0B' },
  low:      { label: 'Low',      color: '#22C55E' },
}

// ─── Team Utilities ───────────────────────────────────────────────────
export const getMemberById = (members, id) => members.find((m) => m.id === id)

export const workloadColor = (pct) => {
  if (pct >= 85) return '#EF4444'
  if (pct >= 70) return '#F97316'
  return '#22C55E'
}
