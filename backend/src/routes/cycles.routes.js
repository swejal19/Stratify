import express from 'express'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import {
  getActiveCycle,
  getAllCycles,
  createCycle,
  toggleCycle,
} from '../controllers/cycles.controller.js'

const router = express.Router()
router.use(protect)

router.get('/active', getActiveCycle)                        // All authenticated users
router.get('/', authorize('admin'), getAllCycles)
router.post('/', authorize('admin'), createCycle)
router.patch('/:id/toggle', authorize('admin'), toggleCycle)

export default router
