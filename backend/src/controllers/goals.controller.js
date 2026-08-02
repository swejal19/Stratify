import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/goals?sheet_id=...
export const getGoals = asyncHandler(async (req, res) => {
  const { sheet_id } = req.query
  const { data, error } = await supabase
    .from('goals').select('*').eq('sheet_id', sheet_id)
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// POST /api/goals
export const createGoal = asyncHandler(async (req, res) => {
  // thrust_area is NOT NULL in DB — default to 'General' if omitted
  const payload = { thrust_area: 'General', ...req.body }
  const { data, error } = await supabase
    .from('goals').insert(payload).select().single()
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.status(201).json({ success: true, data })
})

// PATCH /api/goals/:id
export const updateGoal = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('goals').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// DELETE /api/goals/:id
export const deleteGoal = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('goals').delete().eq('id', req.params.id)
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, message: 'Goal deleted' })
})
