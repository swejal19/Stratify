import express from 'express'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { getAuditLogs } from '../controllers/audit.controller.js'

const router = express.Router()

router.get('/', protect, authorize('admin'), getAuditLogs)

export default router
