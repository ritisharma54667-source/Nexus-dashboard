import { Router } from 'express'
import { listActivity } from '../controllers/activity.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.get('/', requireAuth, asyncHandler(listActivity))

export default router
