/**
 * calculateGoalScore
 * Computes a 0–100 score for a single goal based on its Unit of Measure (UoM).
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
  if (uom === 'zero') {
    return isZero || actual === 0 ? 100 : 0
  }

  if (uom === 'timeline') {
    if (!actualDate || !targetDate) return 0
    return new Date(actualDate + 'T00:00:00') <=
      new Date(targetDate + 'T00:00:00')
      ? 100
      : 0
  }

  if (uom === 'numeric_min') {
    if (!actual || !target) return 0
    return Math.min((parseFloat(actual) / parseFloat(target)) * 100, 100)
  }

  if (uom === 'numeric_max') {
    if (!actual || !target) return 0
    return Math.min((parseFloat(target) / parseFloat(actual)) * 100, 100)
  }

  return 0
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
