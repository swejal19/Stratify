import { supabase } from '../config/db.js'
import { generateToken } from '../config/jwt.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required',
    })
  }

  // Delegate credential verification to Supabase Auth
  const { data: authData, error: authError } = await supabase.auth
    .signInWithPassword({ email, password })

  if (authError) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    })
  }

  // Fetch the extended profile (role, department, manager_id, etc.)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found',
    })
  }

  // Issue a short-lived JWT containing only what's needed for middleware
  const token = generateToken({
    id: profile.id,
    role: profile.role,
    email: profile.email,
  })

  res.json({
    success: true,
    token,
    user: {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role,
      department: profile.department,
      manager_id: profile.manager_id,
    },
  })
})

// ─── POST /api/auth/register (Admin only) ────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, role, department, manager_id } = req.body

  // Create the Supabase Auth user (service key bypasses email verification requirement)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (error) {
    return res.status(400).json({ success: false, message: error.message })
  }

  // Insert the extended profile row linked to the auth user's UUID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      full_name,
      email,
      role: role || 'employee',
      department: department || null,
      manager_id: manager_id || null,
    })
    .select()
    .single()

  if (profileError) {
    return res.status(400).json({ success: false, message: profileError.message })
  }

  res.status(201).json({ success: true, data: profile })
})

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user is already the full profile, hydrated by the protect middleware
  res.json({ success: true, data: req.user })
})
