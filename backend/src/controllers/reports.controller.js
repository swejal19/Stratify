import { supabase } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { calculateGoalScore } from '../utils/scoreCalculator.js'

const getCurrentQuarter = (cycle) => {
  if (!cycle) return { name: 'Q1', quarter: 1 };
  const now = new Date().getTime();
  const q1 = cycle.q1_open ? new Date(cycle.q1_open).getTime() : 0;
  const q2 = cycle.q2_open ? new Date(cycle.q2_open).getTime() : Infinity;
  const q3 = cycle.q3_open ? new Date(cycle.q3_open).getTime() : Infinity;
  const q4 = cycle.q4_open ? new Date(cycle.q4_open).getTime() : Infinity;
  if (now >= q4) return { name: `Q4 Check-in — ${cycle.year}`, quarter: 4 };
  if (now >= q3) return { name: `Q3 Check-in — ${cycle.year}`, quarter: 3 };
  if (now >= q2) return { name: `Q2 Check-in — ${cycle.year}`, quarter: 2 };
  return { name: `Q1 Check-in — ${cycle.year}`, quarter: 1 };
};

const round = (value) => Number.isFinite(value) ? Math.round(value) : 0;

// GET /api/reports?cycle_id=...
export const getReport = asyncHandler(async (req, res) => {
  const { cycle_id } = req.query

  const { data: cycle } = await supabase.from('cycles').select('*').eq('id', cycle_id).single()

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
    .from('profiles').select('id, full_name, department, role')

  // --- 1. Calculate Reports Data (for AdminReports.jsx) ---
  const formatTarget = (goal) => {
    if (goal.uom === 'timeline') {
      return goal.target_date
        ? new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-GB')
        : '--';
    }
    if (goal.uom === 'zero') return 'Zero (Pass/Fail)';
    return (goal.target !== null && goal.target !== undefined && goal.target !== '')
      ? goal.target
      : '--';
  };

  const formatActual = (ach, goal) => {
    if (!ach) return '';
    if (goal.uom === 'timeline') {
      return ach.actual_date
        ? new Date(ach.actual_date + 'T00:00:00').toLocaleDateString('en-GB')
        : '--';
    }
    if (goal.uom === 'zero') return ach.actual === 0 ? 'Yes (Zero ✓)' : 'No';
    return ach.actual !== null && ach.actual !== undefined ? ach.actual : '--';
  };

  const reportsRows = [];
  goals?.forEach(goal => {
    const sheet = sheets?.find(s => s.id === goal.sheet_id);
    if (!sheet) return;
    
    const employee = profiles?.find(p => p.id === sheet.employee_id);
    if (!employee) return;

    const q1 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 1);
    const q2 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 2);
    const q3 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 3);
    const q4 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 4);

    const calcQScore = (ach) => {
      if (!ach) return null;
      const isZero = ach.actual === 0 && goal.uom === 'zero';
      // Backend uses the synced calculateGoalScore which returns uncapped 0-150 score.
      return calculateGoalScore(
        goal.uom, goal.target, goal.target_date,
        ach.actual, ach.actual_date,
        isZero
      );
    };

    const s1 = calcQScore(q1);
    const s2 = calcQScore(q2);
    const s3 = calcQScore(q3);
    const s4 = calcQScore(q4);

    const validScores = [s1, s2, s3, s4].filter(s => s !== null);
    const avgQ = validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : null;
    const overall = avgQ !== null ? (Number(goal.weightage) / 100) * avgQ : null;

    reportsRows.push({
      employee: employee.full_name,
      department: employee.department || 'N/A',
      goal: goal.title,
      uom: goal.uom,
      weightage: goal.weightage,
      target: formatTarget(goal),
      q1_actual: formatActual(q1, goal),
      q1_score: s1,
      q2_actual: formatActual(q2, goal),
      q2_score: s2,
      q3_actual: formatActual(q3, goal),
      q3_score: s3,
      q4_actual: formatActual(q4, goal),
      q4_score: s4,
      overall
    });
  });

  reportsRows.sort((a, b) => a.employee.localeCompare(b.employee));


  // --- 2. Calculate Analytics Data (for AdminAnalytics.jsx) ---
  const currentQuarterInfo = getCurrentQuarter(cycle);
  const currentQuarter = currentQuarterInfo.quarter;

  const employees = profiles?.filter((p) => p.role === 'employee') || [];
  const sheetByEmployee = Object.fromEntries(sheets?.map((s) => [s.employee_id, s]) || []);
  const goalById = Object.fromEntries(goals?.map((g) => [g.id, g]) || []);
  const achievementByGoal = (achievements || []).reduce((acc, ach) => {
    const list = acc[ach.goal_id] || [];
    list.push(ach);
    acc[ach.goal_id] = list;
    return acc;
  }, {});

  const employeeStats = employees.map((employee) => {
    const sheet = sheetByEmployee[employee.id];
    const employeeGoals = sheet ? (goals || []).filter((g) => g.sheet_id === sheet.id) : [];

    const quarterScores = [1, 2, 3, 4].map((quarter) => {
      const score = employeeGoals.reduce((total, goal) => {
        const achievement = (achievementByGoal[goal.id] || []).find((item) => Number(item.quarter) === quarter);
        if (!achievement) return total;
        const rawScore = calculateGoalScore(
          goal.uom,
          goal.target,
          goal.target_date,
          achievement.actual,
          achievement.actual_date,
          achievement.actual === 0 && goal.uom === 'zero'
        );
        return total + (Number(goal.weightage || 0) / 100) * rawScore; // Uncapped (up to 150)
      }, 0);
      return round(score);
    });

    const currentAchievements = employeeGoals.flatMap((goal) =>
      (achievementByGoal[goal.id] || []).filter((item) => Number(item.quarter) === currentQuarter)
    );
    const currentWeightedScore = quarterScores[currentQuarter - 1] || 0;
    const goalsUpdated = currentAchievements.length;

    const statusCounts = currentAchievements.reduce(
      (counts, achievement) => {
        const status = achievement.status;
        if (status === 'completed') counts.completed += 1;
        else if (status === 'on_track') counts.onTrack += 1;
        else counts.notStarted += 1;
        return counts;
      },
      { notStarted: 0, onTrack: 0, completed: 0 }
    );

    return {
      ...employee,
      sheet,
      quarterScores,
      currentWeightedScore,
      goalsUpdated,
      statusCounts
    };
  });

  const quarterTrendData = [1, 2, 3, 4].map((quarter) => {
    const item = {
      quarter: `Q${quarter}`,
      totalScore: 0,
      employeeCount: employees.length
    };
    employeeStats.forEach((employee) => {
      const score = employee.quarterScores[quarter - 1] || 0;
      item[`emp_${employee.id}`] = score;
      item.totalScore += score;
    });
    return item;
  });

  const thrustAreaMap = {};
  goals?.forEach((goal) => {
    const area = goal.thrust_area || 'Unspecified';
    thrustAreaMap[area] = (thrustAreaMap[area] || 0) + 1;
  });
  const thrustAreaData = Object.entries(thrustAreaMap).map(([name, value]) => ({ name, value }));

  const UOM_LABELS = {
    numeric_min: 'Higher is Better',
    numeric_max: 'Lower is Better',
    timeline: 'Date-based',
    zero: 'Zero = Success'
  };
  const uomMap = {};
  goals?.forEach((goal) => {
    const label = UOM_LABELS[goal.uom] || goal.uom;
    uomMap[label] = (uomMap[label] || 0) + 1;
  });
  const uomData = Object.entries(uomMap).map(([name, value]) => ({ name, value }));

  const statusData = employeeStats.map((employee) => ({
    employee: employee.full_name,
    notStarted: employee.statusCounts.notStarted,
    onTrack: employee.statusCounts.onTrack,
    completed: employee.statusCounts.completed
  }));

  const leaderboardData = [...employeeStats]
    .sort((a, b) => b.currentWeightedScore - a.currentWeightedScore)
    .map((employee, index) => ({
      rank: index + 1,
      name: employee.full_name,
      department: employee.department || 'N/A',
      goalsUpdated: employee.goalsUpdated,
      score: employee.currentWeightedScore
    }));

  const avgTeamScore = employees.length > 0
    ? employeeStats.reduce((sum, employee) => sum + employee.currentWeightedScore, 0) / employees.length
    : 0;

  const totalOnTrack = (achievements || []).filter((ach) => ach.status === 'on_track').length;
  const totalCompleted = (achievements || []).filter((ach) => ach.status === 'completed').length;
  const employeesWithComments = new Set(
    (achievements || [])
      .filter((ach) => Number(ach.quarter) === currentQuarter && ach.manager_comment !== null)
      .flatMap((ach) => {
        const goal = goalById[ach.goal_id];
        const sheet = sheets?.find((s) => s.id === goal?.sheet_id);
        return sheet ? [sheet.employee_id] : [];
      })
      .filter(Boolean)
  );
  const checkinRate = employees.length > 0
    ? (employeesWithComments.size / employees.length) * 100
    : 0;

  const radarData = quarterTrendData.map((item) => ({
    metric: item.quarter,
    score: item.employeeCount > 0 ? round(item.totalScore / item.employeeCount) : 0
  }));

  res.json({
    success: true,
    data: {
      reports: reportsRows,
      analytics: {
        employees: employeeStats,
        quarterTrendData,
        thrustAreaData,
        uomData,
        statusData,
        leaderboardData,
        avgTeamScore,
        totalOnTrack,
        totalCompleted,
        checkinRate,
        radarData
      }
    }
  })
})
