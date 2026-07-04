/**
 * routes/auth.routes.js
 */

import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { loginLimiter, signupLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Express 4 doesn't automatically catch rejected promises in async
// handlers — this small wrapper forwards any thrown/rejected error to
// the central error handler instead of crashing the process.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.post('/signup', signupLimiter, asyncHandler(authController.signup))
router.post('/login', loginLimiter, asyncHandler(authController.login))
router.post('/refresh', asyncHandler(authController.refresh))
router.post('/logout', asyncHandler(authController.logout))
router.get('/me', requireAuth, asyncHandler(authController.me))
router.post('/forgot-password', forgotPasswordLimiter, asyncHandler(authController.forgotPassword))
router.post('/reset-password', asyncHandler(authController.resetPassword))

export default router
