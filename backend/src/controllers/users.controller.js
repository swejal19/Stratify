import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/users (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { data } = await supabase
    .from('profiles').select('*').order('full_name')
  res.json({ success: true, data })
})

// PATCH /api/users/:id (admin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('profiles').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// POST /api/users (admin only)
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, full_name, role, department, manager_id } = req.body

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  })

  if (error) return res.status(400).json({ success: false, message: error.message })

  const { data: profile } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      full_name,
      email,
      role: role || 'employee',
      department: department || null,
      manager_id: manager_id || null
    })
    .select().single()

  res.status(201).json({ success: true, data: profile })
})
