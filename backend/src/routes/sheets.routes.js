import express from 'express'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import {
  getMySheet,
  submitSheet,
  approveSheet,
  returnForRework,
  getTeamSheets,
} from '../controllers/sheets.controller.js'

const router = express.Router()
router.use(protect)

router.get('/active', getMySheet)
router.get('/team', authorize('manager', 'admin'), getTeamSheets)
router.patch('/:id/submit', submitSheet)
router.patch('/:id/approve', authorize('manager', 'admin'), approveSheet)
router.patch('/:id/rework', authorize('manager', 'admin'), returnForRework)

export default router
