import express from 'express'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { getAllUsers, updateUser, createUser } from '../controllers/users.controller.js'

const router = express.Router()

// All users routes are admin-only — apply both middlewares globally
router.use(protect, authorize('admin'))

router.get('/', getAllUsers)
router.post('/', createUser)
router.patch('/:id', updateUser)

export default router
