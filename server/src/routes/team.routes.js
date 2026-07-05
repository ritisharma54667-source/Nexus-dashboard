import { Router } from 'express'
import * as team from '../controllers/team.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(team.listTeam))
router.post('/', asyncHandler(team.createTeamMember))
router.patch('/:id', asyncHandler(team.updateTeamMember))
router.delete('/:id', asyncHandler(team.deleteTeamMember))

export default router
