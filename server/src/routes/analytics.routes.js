import { Router } from 'express'
import { getAnalytics } from '../controllers/analytics.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.get('/', requireAuth, asyncHandler(getAnalytics))

export default router
