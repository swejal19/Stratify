import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/audit (admin only)
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, profiles:changed_by(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})
