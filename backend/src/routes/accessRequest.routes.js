import express from 'express'
import { 
  requestAccess, 
  getAccessRequests, 
  approveRequest, 
  rejectRequest 
} from '../controllers/accessRequest.controller.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

// Public route — no auth needed
router.post('/request-access', requestAccess)

// Admin only routes
router.get(
  '/admin/access-requests', 
  protect, 
  authorize('admin'), 
  getAccessRequests
)
router.patch(
  '/admin/access-requests/:id/approve', 
  protect, 
  authorize('admin'), 
  approveRequest
)
router.patch(
  '/admin/access-requests/:id/reject', 
  protect, 
  authorize('admin'), 
  rejectRequest
)

export default router
