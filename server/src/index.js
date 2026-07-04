/**
 * index.js — Nexus Dashboard API entry point
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import authRoutes from './routes/auth.routes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// ── Core middleware ─────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, // required so the browser sends/receives the refresh cookie
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Routes ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'nexus-dashboard-api' }))
app.use('/api/auth', authRoutes)

// ── 404 + error handling (must be last) ─────────────────────────
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✔ Nexus Dashboard API running on http://localhost:${PORT}`)
})
