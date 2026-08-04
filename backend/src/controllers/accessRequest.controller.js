import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// POST /api/auth/request-access (PUBLIC - no auth needed)
export const requestAccess = asyncHandler(async (req, res) => {
  const { full_name, email, role, department, manager_email } = req.body

  // Validate required fields
  if (!full_name || !email || !role) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email and role are required'
    })
  }

  // Block admin role requests
  if (role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be requested'
    })
  }

  // Check if user already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existingProfile) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists'
    })
  }

  // Check for existing pending request
  const { data: existingRequest } = await supabase
    .from('access_requests')
    .select('id, status')
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .single()

  if (existingRequest) {
    return res.status(409).json({
      success: false,
      message: 'A pending request for this email already exists'
    })
  }

  // Insert access request
  const { data, error } = await supabase
    .from('access_requests')
    .insert({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department: department || null,
      manager_email: manager_email || null,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }

  res.status(201).json({
    success: true,
    message: 'Access request submitted successfully. You will be notified once approved.',
    data: { id: data.id, status: 'pending' }
  })
})

// GET /api/admin/access-requests (admin only)
export const getAccessRequests = asyncHandler(async (req, res) => {
  const { status } = req.query

  let query = supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return res.status(400).json({ success: false, message: error.message })

  res.json({ success: true, data })
})

// PATCH /api/admin/access-requests/:id/approve (admin only)
export const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Get the request
  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !request) {
    return res.status(404).json({
      success: false,
      message: 'Access request not found'
    })
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Request is already ${request.status}`
    })
  }

  // Generate temporary password
  const tempPassword = `Stratify@${Math.random().toString(36).slice(-6).toUpperCase()}`

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: request.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: request.full_name }
  })

  if (authError) {
    return res.status(400).json({
      success: false,
      message: `Failed to create account: ${authError.message}`
    })
  }

  // Find manager by email if provided
  let managerId = null
  if (request.manager_email) {
    const { data: manager } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', request.manager_email.toLowerCase())
      .single()
    managerId = manager?.id || null
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: request.full_name,
      email: request.email,
      role: request.role,
      department: request.department || null,
      manager_id: managerId
    })

  if (profileError) {
    // Cleanup auth user if profile fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return res.status(400).json({
      success: false,
      message: `Failed to create profile: ${profileError.message}`
    })
  }

  // Update request status
  await supabase
    .from('access_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user.id
    })
    .eq('id', id)

  // Log to audit
  await supabase.from('audit_logs').insert({
    table_name: 'access_requests',
    record_id: id,
    action: 'access_request_approved',
    changed_by: req.user.id,
    new_data: {
      email: request.email,
      role: request.role,
      approved_by: req.user.full_name
    }
  })

  res.json({
    success: true,
    message: `Account created for ${request.full_name}`,
    data: {
      email: request.email,
      temporary_password: tempPassword,
      role: request.role
    }
  })
})

// PATCH /api/admin/access-requests/:id/reject (admin only)
export const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rejection_reason } = req.body

  const { data: request } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    })
  }

  await supabase
    .from('access_requests')
    .update({
      status: 'rejected',
      rejection_reason: rejection_reason || 'Request rejected by admin',
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user.id
    })
    .eq('id', id)

  // Log to audit
  await supabase.from('audit_logs').insert({
    table_name: 'access_requests',
    record_id: id,
    action: 'access_request_rejected',
    changed_by: req.user.id,
    new_data: {
      email: request.email,
      reason: rejection_reason || 'Not specified'
    }
  })

  res.json({
    success: true,
    message: 'Request rejected successfully'
  })
})
