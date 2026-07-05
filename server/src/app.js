/**
 * app.js — builds the Express app without starting a listener.
 * Split out from index.js so tests can import the app directly via
 * supertest without binding to a real port.
 */

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import authRoutes from './routes/auth.routes.js'
import projectsRoutes from './routes/projects.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import activityRoutes from './routes/activity.routes.js'
import teamRoutes from './routes/team.routes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(cookieParser())
  app.use(express.json())
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  }

  app.get('/api/health', (req, res) => res.json({ ok: true, service: 'nexus-dashboard-api' }))
  app.use('/api/auth', authRoutes)
  app.use('/api/projects', projectsRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/api/activity', activityRoutes)
  app.use('/api/team', teamRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
