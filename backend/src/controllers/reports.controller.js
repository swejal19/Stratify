import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { calculateGoalScore } from '../utils/scoreCalculator.js'

// GET /api/reports?cycle_id=...
export const getReport = asyncHandler(async (req, res) => {
  const { cycle_id } = req.query

  const { data: sheets } = await supabase
    .from('goal_sheets')
    .select('id, employee_id')
    .eq('cycle_id', cycle_id)

  const sheetIds = sheets?.map(s => s.id) || []

  const { data: goals } = await supabase
    .from('goals').select('*').in('sheet_id', sheetIds)

  const goalIds = goals?.map(g => g.id) || []

  const { data: achievements } = await supabase
    .from('achievements').select('*').in('goal_id', goalIds)

  const { data: profiles } = await supabase
    .from('profiles').select('id, full_name, department')

  const rows = goals?.map(goal => {
    const sheet = sheets.find(s => s.id === goal.sheet_id)
    const employee = profiles.find(p => p.id === sheet?.employee_id)

    const getQ = (q) =>
      achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === q)

    const calcScore = (ach) =>
      ach
        ? Math.min(
            calculateGoalScore(
              goal.uom, goal.target, goal.target_date,
              ach.actual, ach.actual_date,
              ach.actual === 0 && goal.uom === 'zero'
            ),
            100
          )
        : null

    const q1 = getQ(1); const q2 = getQ(2)
    const q3 = getQ(3); const q4 = getQ(4)

    const scores = [calcScore(q1), calcScore(q2), calcScore(q3), calcScore(q4)]
    const validScores = scores.filter(s => s !== null)
    const avgScore = validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : null

    return {
      employee: employee?.full_name,
      department: employee?.department,
      goal: goal.title,
      uom: goal.uom,
      weightage: goal.weightage,
      target: goal.uom === 'timeline' ? goal.target_date : goal.target,
      q1_actual: q1?.actual ?? q1?.actual_date,
      q1_score: calcScore(q1),
      q2_actual: q2?.actual ?? q2?.actual_date,
      q2_score: calcScore(q2),
      q3_actual: q3?.actual ?? q3?.actual_date,
      q3_score: calcScore(q3),
      q4_actual: q4?.actual ?? q4?.actual_date,
      q4_score: calcScore(q4),
      weighted_score:
        avgScore !== null
          ? Math.round((goal.weightage / 100) * avgScore)
          : null,
    }
  })

  res.json({ success: true, data: rows })
})
