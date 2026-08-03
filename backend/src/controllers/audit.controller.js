import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/audit (admin only)
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return res.status(400).json({ success: false, message: error.message })

  const userIds = [...new Set(logs?.map(log => log.changed_by).filter(Boolean) || [])]
  
  let profilesMap = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)
      
    if (profiles) {
      profiles.forEach(p => {
        profilesMap[p.id] = p
      })
    }
  }

  const enrichedLogs = (logs || []).map(log => ({
    ...log,
    profiles: log.changed_by ? profilesMap[log.changed_by] : null
  }))

  res.json({ success: true, data: enrichedLogs })
})
