import { Router } from 'express'
import * as projects from '../controllers/projects.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth) // every project route requires a logged-in user

router.get('/', asyncHandler(projects.listProjects))
router.post('/', asyncHandler(projects.createProject))
router.get('/:id', asyncHandler(projects.getProject))
router.patch('/:id', asyncHandler(projects.updateProject))
router.delete('/:id', asyncHandler(projects.deleteProject))
router.post('/:id/archive', asyncHandler(projects.archiveProject))
router.post('/:id/unarchive', asyncHandler(projects.unarchiveProject))

export default router
