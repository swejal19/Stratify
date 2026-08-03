import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/sheets/active — get my sheet for active cycle (auto-creates if missing)
export const getMySheet = asyncHandler(async (req, res) => {
  const { data: cycle } = await supabase
    .from('cycles').select('id').eq('is_active', true).single()

  if (!cycle) return res.status(404).json({ success: false, message: 'No active cycle' })

  let { data: sheet } = await supabase
    .from('goal_sheets')
    .select('*')
    .eq('employee_id', req.user.id)
    .eq('cycle_id', cycle.id)
    .single()

  if (!sheet) {
    const { data: newSheet } = await supabase
      .from('goal_sheets')
      .insert({ employee_id: req.user.id, cycle_id: cycle.id, status: 'draft' })
      .select().single()
    sheet = newSheet
  }

  res.json({ success: true, data: sheet })
})

// PATCH /api/sheets/:id/submit
export const submitSheet = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('employee_id', req.user.id)
    .select().single()

  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// PATCH /api/sheets/:id/approve (manager/admin only)
export const approveSheet = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({
      status: 'locked',
      approved_by: req.user.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select().single()

  if (error) return res.status(400).json({ success: false, message: error.message })

  // Audit log
  await supabase.from('audit_logs').insert({
    table_name: 'goal_sheets',
    record_id: req.params.id,
    action: 'approved',
    changed_by: req.user.id,
    new_data: { status: 'locked' }
  })

  res.json({ success: true, data })
})

// PATCH /api/sheets/:id/rework (manager/admin only)
export const returnForRework = asyncHandler(async (req, res) => {
  const { manager_comment } = req.body
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({ status: 'rework', manager_comment })
    .eq('id', req.params.id)
    .select().single()

  if (error) return res.status(400).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// GET /api/sheets/team (manager/admin only)
export const getTeamSheets = asyncHandler(async (req, res) => {
  const { data: cycle } = await supabase
    .from('cycles').select('id').eq('is_active', true).single()

  let teamQuery = supabase.from('profiles').select('id, full_name, email, department');
  if (req.user.role === 'admin') {
    teamQuery = teamQuery.eq('role', 'employee');
  } else {
    teamQuery = teamQuery.eq('manager_id', req.user.id);
  }
  const { data: team } = await teamQuery;

  const teamIds = team?.map(t => t.id) || []

  const { data: sheets } = await supabase
    .from('goal_sheets')
    .select('*')
    .eq('cycle_id', cycle.id)
    .in('employee_id', teamIds)

  const sheetIds = sheets?.map(s => s.id) || [];
  const { data: goals } = sheetIds.length 
    ? await supabase.from('goals').select('sheet_id, weightage').in('sheet_id', sheetIds)
    : { data: [] };

  const sheetsWithWeightage = sheets?.map(sheet => {
    const sheetGoals = goals?.filter(g => g.sheet_id === sheet.id) || [];
    const totalWeightage = sheetGoals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);
    return { ...sheet, totalWeightage };
  }) || [];

  res.json({ success: true, data: { team, sheets: sheetsWithWeightage } })
})
