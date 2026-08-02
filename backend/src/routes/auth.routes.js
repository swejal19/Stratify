import express from 'express'
import { login, register, getMe } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

// Public
router.post('/login', login)

// Admin only — protected + role-guarded
router.post('/register', protect, authorize('admin'), register)

// Authenticated users only
router.get('/me', protect, getMe)

export default router
