/**
 * calculateGoalScore
 * Computes a 0–150 score for a single goal based on its Unit of Measure (UoM).
 *
 * UoM types:
 *  - 'zero'        : Goal is to achieve zero / no occurrences.
 *  - 'timeline'    : Goal is to finish by a target date.
 *  - 'numeric_min' : Higher actual is better (e.g., revenue, units sold).
 *  - 'numeric_max' : Lower actual is better (e.g., cost, defect count).
 */
export const calculateGoalScore = (
  uom,
  target,
  targetDate,
  actual,
  actualDate,
  isZero = false
) => {
  // Treat empty strings as null - don't calculate score without actual data saved
  if (uom === 'timeline') {
    if (!actualDate) return 0;
  } else if ((actual === '' || actual === null || actual === undefined) && !isZero) {
    return 0;
  }

  const numActual = actual === '' ? 0 : Number(actual) || 0;
  const numTarget = Number(target) || 0;

  switch (uom) {
    case 'numeric_min': {
      if (numTarget === 0) return numActual > 0 ? 150 : 0; // Avoid divide by zero
      const score = (numActual / numTarget) * 100;
      return Math.min(Math.max(score, 0), 150); // Cap at 150%
    }
    
    case 'numeric_max': {
      if (numActual === 0) return 150; // Achieved 0 on a minimize goal
      const score = (numTarget / numActual) * 100;
      return Math.min(Math.max(score, 0), 150);
    }
    
    case 'timeline': {
      if (!actualDate || !targetDate) return 0;
      const actualD = new Date(actualDate + 'T00:00:00').getTime();
      const targetD = new Date(targetDate + 'T00:00:00').getTime();
      return actualD <= targetD ? 100 : 0;
    }
    
    case 'zero': {
      // Only return 100% if explicitly marked as zero (isZero), not when actual is empty
      return isZero ? 100 : 0;
    }
    
    default:
      return 0;
  }
}

/**
 * calculateWeightedScore
 * Aggregates weighted scores across all goals for a given quarter.
 *
 * @param {Array} goals        - Array of goal objects (must have id, uom, target, target_date, weightage)
 * @param {Array} achievements - Array of achievement objects (must have goal_id, quarter, actual, actual_date)
 * @param {number|string} quarter - The quarter number to filter achievements by
 * @returns {number} Rounded total weighted score (0–100)
 */
export const calculateWeightedScore = (goals, achievements, quarter) => {
  let totalScore = 0

  goals.forEach((goal) => {
    const ach = achievements.find(
      (a) =>
        a.goal_id === goal.id && Number(a.quarter) === Number(quarter)
    )

    if (ach) {
      const score = calculateGoalScore(
        goal.uom,
        goal.target,
        goal.target_date,
        ach.actual,
        ach.actual_date,
        ach.actual === 0 && goal.uom === 'zero'
      )
      totalScore += (Number(goal.weightage) / 100) * score
    }
  })

  return Math.round(totalScore)
}
