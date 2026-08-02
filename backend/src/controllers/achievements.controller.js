import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/achievements?goal_ids=id1,id2&quarter=1
export const getAchievements = asyncHandler(async (req, res) => {
  const { goal_ids, quarter } = req.query
  const ids = goal_ids.split(',')

  let query = supabase.from('achievements').select('*').in('goal_id', ids)
  if (quarter) query = query.eq('quarter', Number(quarter))

  const { data, error } = await query
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// POST /api/achievements/upsert
export const upsertAchievement = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('achievements')
    .upsert(req.body, { onConflict: 'goal_id,quarter,cycle_id' })
    .select().single()
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// PATCH /api/achievements/checkin-comment (manager/admin only)
export const updateCheckinComment = asyncHandler(async (req, res) => {
  const { achievement_ids, manager_comment } = req.body
  const { data, error } = await supabase
    .from('achievements')
    .update({ manager_comment })
    .in('id', achievement_ids)
    .select()
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})
