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

// DELETE /api/users/:id (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Prevent admin from deleting themselves
  if (id === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    })
  }

  // Step 1: Check user exists
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', id)
    .single()

  if (userError || !user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  // Prevent deleting other admins
  if (user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Cannot delete admin accounts'
    })
  }

  // Step 2: Get all goal sheets for this user
  const { data: sheets } = await supabase
    .from('goal_sheets')
    .select('id')
    .eq('employee_id', id)

  if (sheets && sheets.length > 0) {
    const sheetIds = sheets.map(s => s.id)

    // Step 3: Get all goals in those sheets
    const { data: goals } = await supabase
      .from('goals')
      .select('id')
      .in('sheet_id', sheetIds)

    if (goals && goals.length > 0) {
      const goalIds = goals.map(g => g.id)

      // Step 4: Delete all achievements
      await supabase
        .from('achievements')
        .delete()
        .in('goal_id', goalIds)

      // Step 5: Delete all goals
      await supabase
        .from('goals')
        .delete()
        .in('sheet_id', sheetIds)
    }

    // Step 6: Delete all goal sheets
    await supabase
      .from('goal_sheets')
      .delete()
      .in('id', sheetIds)
  }

  // Step 7: Remove as manager for any employees
  await supabase
    .from('profiles')
    .update({ manager_id: null })
    .eq('manager_id', id)

  // Step 8: Delete profile
  await supabase
    .from('profiles')
    .delete()
    .eq('id', id)

  // Step 9: Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  if (authError) {
    console.error('Auth delete error:', authError)
    // Don't fail — profile is already deleted
  }

  // Step 10: Log to audit
  await supabase.from('audit_logs').insert({
    table_name: 'profiles',
    record_id: id,
    action: 'admin_delete_user',
    changed_by: req.user.id,
    old_data: { 
      full_name: user.full_name, 
      email: user.email,
      role: user.role 
    },
    new_data: { deleted: true }
  })

  res.json({
    success: true,
    message: `User ${user.full_name} and all associated data deleted successfully`
  })
})
