export const getCurrentQuarter = (cycle) => {
  if (!cycle) return { name: 'Q1', quarter: 1 };

  const now = new Date().getTime();
  const q1 = cycle.q1_open ? new Date(cycle.q1_open).getTime() : 0;
  const q2 = cycle.q2_open ? new Date(cycle.q2_open).getTime() : Infinity;
  const q3 = cycle.q3_open ? new Date(cycle.q3_open).getTime() : Infinity;
  const q4 = cycle.q4_open ? new Date(cycle.q4_open).getTime() : Infinity;

  if (now >= q4) return { name: `Q4 Check-in \u2014 ${cycle.year}`, quarter: 4 };
  if (now >= q3) return { name: `Q3 Check-in \u2014 ${cycle.year}`, quarter: 3 };
  if (now >= q2) return { name: `Q2 Check-in \u2014 ${cycle.year}`, quarter: 2 };
  return { name: `Q1 Check-in \u2014 ${cycle.year}`, quarter: 1 };
};

export const calculateGoalScore = (uom, target, targetDate, actual, actualDate, isZero) => {
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
};
