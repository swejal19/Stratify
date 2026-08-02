import express from 'express'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { getReport } from '../controllers/reports.controller.js'

const router = express.Router()

router.get('/', protect, authorize('manager', 'admin'), getReport)

export default router
