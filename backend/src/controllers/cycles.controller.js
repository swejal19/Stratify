import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/cycles/active
export const getActiveCycle = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('cycles').select('*').eq('is_active', true).single()
  if (error) return res.status(404).json({ success: false, message: 'No active cycle' })
  res.json({ success: true, data })
})

// GET /api/cycles (admin only)
export const getAllCycles = asyncHandler(async (req, res) => {
  const { data } = await supabase
    .from('cycles').select('*').order('created_at', { ascending: false })
  res.json({ success: true, data })
})

// POST /api/cycles (admin only)
export const createCycle = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('cycles').insert(req.body).select().single()
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.status(201).json({ success: true, data })
})

// PATCH /api/cycles/:id/toggle (admin only)
// Pass { makeActive: true } to activate this cycle and deactivate all others.
export const toggleCycle = asyncHandler(async (req, res) => {
  const { makeActive } = req.body

  if (makeActive) {
    // Deactivate every other cycle first
    await supabase
      .from('cycles')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000') // effectively "all rows"
  }

  const { data, error } = await supabase
    .from('cycles')
    .update({ is_active: makeActive })
    .eq('id', req.params.id)
    .select().single()

  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})
