import React, { useState, useEffect } from 'react';
import { useActiveCycle, useGoalSheet, useGoals } from '../hooks/useGoals';
import { useQuarterAchievements } from '../hooks/useAchievements';
import { getCurrentQuarter, calculateGoalScore } from '../utils/achievementUtils';
import { supabase } from '../lib/supabase';

export const EmployeeProgress = () => {
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: sheet, isLoading: sheetLoading } = useGoalSheet(cycle?.id);
  const { data: goals, isLoading: goalsLoading } = useGoals(sheet?.id);

  const currentQuarterInfo = getCurrentQuarter(cycle);
  const quarter = currentQuarterInfo.quarter;

  const { data: achievements, isLoading: achievementsLoading } = useQuarterAchievements(cycle?.id, quarter);

  const isLoading = cycleLoading || sheetLoading || goalsLoading || achievementsLoading;

  // Initialize achievement data for each goal
  const [goalData, setGoalData] = useState({});

  useEffect(() => {
    if (goals && achievements) {
      const newGoalData = {};
      goals.forEach(goal => {
        const achievement = achievements.find(a => a.goal_id === goal.id);
        if (achievement) {
          newGoalData[goal.id] = {
            actual: achievement.actual,
            actual_date: achievement.actual_date,
            isZero: achievement.actual === 0 && goal.uom === 'zero',
            employee_note: achievement.employee_note || ''
          };
        }
      });
      setGoalData(newGoalData);
    }
  }, [goals, achievements]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-8 text-center bg-surface-container rounded-2xl border border-outline">
        <span className="material-symbols-outlined text-warning text-4xl mb-4">warning</span>
        <h2 className="text-xl font-bold text-slate-700">No Active Cycle</h2>
        <p className="text-slate-700-variant mt-2">There is currently no active goal setting cycle open.</p>
      </div>
    );
  }

  if (!sheet || (sheet.status !== 'locked' && sheet.status !== 'approved')) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-warning/10 border border-warning/20 rounded-2xl animate-fade-in">
        <span className="material-symbols-outlined text-warning text-5xl mb-4">lock_clock</span>
        <h2 className="text-2xl font-bold text-warning">Goals Pending Approval</h2>
        <p className="text-warning/80 mt-2">
          Your goal sheet must be approved and locked by your manager before you can view your progress.
        </p>
      </div>
    );
  }

  // Calculate weighted score
  let overallScore = 0;
  let goalsWithData = 0;

  const goalScores = goals?.map(goal => {
    const data = goalData[goal.id];

    // Calculate raw score then cap at 100
    let rawScore = 0;
    if (data) {
      if (goal.uom === 'zero') {
        rawScore = data.isZero ? 100 : 0;
      } else if (goal.uom === 'timeline') {
        if (data.actual_date && goal.target_date) {
          const actualD = new Date(data.actual_date + 'T00:00:00');
          const targetD = new Date(goal.target_date + 'T00:00:00');
          rawScore = actualD <= targetD ? 100 : 0;
        }
      } else if (goal.uom === 'numeric_min') {
        const actual = parseFloat(data.actual);
        const target = parseFloat(goal.target);
        if (!isNaN(actual) && !isNaN(target) && target > 0) {
          rawScore = (actual / target) * 100;
        }
      } else if (goal.uom === 'numeric_max') {
        const actual = parseFloat(data.actual);
        const target = parseFloat(goal.target);
        if (!isNaN(actual) && !isNaN(target) && actual > 0) {
          rawScore = (target / actual) * 100;
        }
      }
    }
    const score = Math.min(rawScore, 100); // Cap at 100%

    // Format actual value for display
    let displayActual = '--';
    if (data) {
      if (goal.uom === 'zero') {
        displayActual = data.isZero ? 'Achieved (0)' : 'Not achieved';
      } else if (goal.uom === 'timeline') {
        displayActual = data.actual_date || '--';
      } else {
        displayActual = data.actual ?? '--';
      }
    }

    // Format target for display
    let displayTarget = goal.target;
    if (goal.uom === 'zero') {
      displayTarget = '0 Incidents';
    } else if (goal.uom === 'timeline') {
      displayTarget = goal.target_date || '--';
    }

    // Determine status
    let status = 'Not Started';
    let statusColor = 'bg-error/20 text-error';
    if (score >= 100) {
      status = 'Completed';
      statusColor = 'bg-success/20 text-success';
    } else if (score > 0) {
      status = 'On Track';
      statusColor = 'bg-primary/20 text-primary';
    }

    overallScore += (Number(goal.weightage) / 100) * score;

    return {
      ...goal,
      score,
      displayActual,
      displayTarget,
      status,
      statusColor,
      employeeNote: data?.employee_note || ''
    };
  }) || [];

  const totalGoals = goals?.length || 0;
  const completedGoals = goalScores.filter(g => goalData[g.id] !== undefined).length;

  // Quarter summary - check which quarters have data
  const getQuarterStatus = async (q) => {
    if (!cycle?.id) return { hasData: false, score: null };

    const { data } = await supabase
      .from('achievements')
      .select('id, goal_id, actual, manager_comment')
      .eq('cycle_id', cycle.id)
      .eq('quarter', q);

    if (!data || data.length === 0) return { hasData: false, score: null };

    // Get goals for this employee
    const goalIds = data.map(d => d.goal_id);
    const { data: goalData } = await supabase
      .from('goals')
      .select('id, weightage')
      .in('id', goalIds);

    if (!goalData) return { hasData: true, score: null };

    // Calculate score for this quarter
    let quarterScore = 0;
    goalData.forEach(g => {
      const achievement = data.find(a => a.goal_id === g.id);
      if (achievement) {
        const s = calculateGoalScore(g.uom, g.target, g.target_date, achievement.actual, achievement.actual_date, achievement.actual === 0);
        quarterScore += (Number(g.weightage) / 100) * s;
      }
    });

    return { hasData: true, score: Math.round(quarterScore) };
  };

  // Show Q4 as active since that's the current quarter
  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-slate-700">My Progress</h1>
          <p className="text-slate-700-variant font-body-md mt-1">Track your goals and achievements throughout the quarter.</p>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="bg-surface-container rounded-2xl border border-outline p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-400"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - (283 * Math.min(overallScore, 100)) / 100}
                className={`transition-all duration-1000 ease-out ${overallScore >= 80 ? 'text-success' : overallScore >= 50 ? 'text-warning' : 'text-error'}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold font-mono ${overallScore >= 80 ? 'text-success' : overallScore >= 50 ? 'text-warning' : 'text-error'}`}>
                {Math.round(Math.min(overallScore, 100))}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-700 mb-1">{currentQuarterInfo.name}</h2>
            <p className="text-slate-700-variant text-lg">
              Goals Completed: <span className="font-bold text-slate-700">{completedGoals}</span> of <span className="font-bold text-slate-700">{totalGoals}</span>
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span className="text-primary font-bold">Weighted Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quarter Summary */}
      <div className="bg-surface-container rounded-2xl border border-outline p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Quarter Summary</h3>
        <div className="flex gap-4">
          {quarterLabels.map((q, idx) => {
            const isActive = idx + 1 === quarter;
            return (
              <div
                key={q}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${isActive
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-slate-100 border-outline'
                  }`}
              >
                <span className={`text-lg font-bold ${isActive ? 'text-primary' : 'text-slate-700-variant'}`}>
                  {q}
                </span>
                {isActive && (
                  <div className="mt-1 text-xs text-primary font-bold">Active</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Progress Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-700">Goal Progress</h3>

        {goalScores.map((goal) => (
          <div
            key={goal.id}
            className="bg-surface-container rounded-2xl border border-outline p-6 hover:border-primary/20 transition-all animate-fade-in"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">

              {/* Goal Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-700">{goal.title}</h4>
                    <p className="text-slate-700-variant text-sm">{goal.thrust_area} • Weightage: {goal.weightage}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${goal.statusColor}`}>
                    {goal.status}
                  </span>
                </div>

                {/* Target vs Actual */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <p className="text-xs text-slate-400 uppercase font-bold">Target</p>
                    <p className="text-slate-700 font-mono mt-1">{goal.displayTarget}</p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-3">
                    <p className="text-xs text-slate-400 uppercase font-bold">Actual</p>
                    <p className="text-slate-700 font-mono mt-1">{goal.displayActual}</p>
                  </div>
                </div>

                {/* Employee Note */}
                {goal.employeeNote && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-outline">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Your Note</p>
                    <p className="text-slate-700-variant text-sm">{goal.employeeNote}</p>
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="flex flex-col items-center lg:min-w-[120px]">
                <div className="text-3xl font-bold font-mono text-slate-700">{Math.round(goal.score)}%</div>
                <div className="w-32 h-2 bg-surface-variant rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${goal.score >= 100 ? 'bg-success' : goal.score >= 50 ? 'bg-warning' : 'bg-error'
                      }`}
                    style={{ width: `${Math.min(goal.score, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
