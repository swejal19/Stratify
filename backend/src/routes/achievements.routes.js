import express from 'express'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import {
  getAchievements,
  upsertAchievement,
  updateCheckinComment,
} from '../controllers/achievements.controller.js'

const router = express.Router()
router.use(protect)

router.get('/', getAchievements)
router.post('/upsert', upsertAchievement)
router.patch('/checkin-comment', authorize('manager', 'admin'), updateCheckinComment)

export default router
