import React, { useState, useEffect } from 'react';
import { useActiveCycle, useGoalSheet, useGoals } from '../hooks/useGoals';
import { useQuarterAchievements, useUpsertAchievementMutation } from '../hooks/useAchievements';
import { getCurrentQuarter, calculateGoalScore } from '../utils/achievementUtils';

export const EmployeeAchievements = () => {
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: sheet, isLoading: sheetLoading } = useGoalSheet(cycle?.id);
  const { data: goals, isLoading: goalsLoading } = useGoals(sheet?.id);

  const currentQuarterInfo = getCurrentQuarter(cycle);
  const quarter = currentQuarterInfo.quarter;

  const { data: achievements, isLoading: achievementsLoading } = useQuarterAchievements(cycle?.id, quarter);
  const upsertAchievementMutation = useUpsertAchievementMutation();

  const [toastMessage, setToastMessage] = useState(null);

  // Local state to manage form inputs per goal before saving
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Initialize local state from existing achievements when loaded
    if (goals && achievements) {
      const newFormData = {};
      goals.forEach(goal => {
        const achievement = achievements.find(a => a.goal_id === goal.id);
        if (achievement) {
          newFormData[goal.id] = {
            id: achievement.id,
            actual: achievement.actual,
            actual_date: achievement.actual_date,
            isZero: achievement.actual === 0 && goal.uom === 'zero',
            status: achievement.status || 'not_started',
            employee_note: achievement.employee_note || ''
          };
        } else {
          newFormData[goal.id] = {
            id: null,
            actual: '',
            actual_date: '',
            isZero: false,
            status: 'not_started',
            employee_note: ''
          };
        }
      });
      setFormData(newFormData);
    }
  }, [goals, achievements]);

  const isLoading = cycleLoading || sheetLoading || goalsLoading || achievementsLoading;

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
        <h2 className="text-xl font-bold text-slate-700">No Active Cycle</h2>
      </div>
    );
  }

  if (!sheet || (sheet.status !== 'locked' && sheet.status !== 'approved')) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-warning/10 border border-warning/20 rounded-2xl animate-fade-in">
        <span className="material-symbols-outlined text-warning text-5xl mb-4">lock_clock</span>
        <h2 className="text-2xl font-bold text-warning">Goals Pending Approval</h2>
        <p className="text-warning/80 mt-2">
          Your goal sheet must be approved and locked by your manager before you can start logging achievements.
        </p>
      </div>
    );
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFieldChange = (goalId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleSave = async (goal) => {
    const data = formData[goal.id];
    try {
      const payload = {
        goal_id: goal.id,
        quarter: quarter,
        cycle_id: cycle.id,
        actual: goal.uom === 'zero' && data.isZero ? 0 : (goal.uom === 'timeline' ? null : (data.actual ? Number(data.actual) : null)),
        actual_date: goal.uom === 'timeline' ? (data.actual_date || null) : null,
        status: data.status,
        employee_note: data.employee_note || null,
      };

      const score = calculateGoalScore(goal.uom, goal.target, goal.target_date, payload.actual, payload.actual_date, data.isZero);

      // Only include id for updates, not inserts
      if (data.id) {
        payload.id = data.id;
      }
      await upsertAchievementMutation.mutateAsync(payload);
      showToast('Achievement saved successfully');
    } catch (err) {
      alert('Failed to save achievement: ' + (err.message || err));
    }
  };

  // Calculate Overall Weighted Score - sum of (weightage/100 * score) for ALL goals
  // Goals without achievement data contribute 0 to the weighted total
  let overallScore = 0;
  goals?.forEach(goal => {
    const data = formData[goal.id];
    if (!data) return;

    let score = 0;

    if (goal.uom === 'zero') {
      score = data.isZero ? 100 : 0;
    } else if (goal.uom === 'timeline') {
      if (data.actual_date && goal.target_date) {
        const actualD = new Date(data.actual_date + 'T00:00:00');
        const targetD = new Date(goal.target_date + 'T00:00:00');
        score = actualD <= targetD ? 100 : 0;
      }
    } else if (goal.uom === 'numeric_min') {
      const actual = parseFloat(data.actual);
      const target = parseFloat(goal.target);
      if (!isNaN(actual) && !isNaN(target) && target > 0) {
        score = Math.min((actual / target) * 100, 100);
      }
    } else if (goal.uom === 'numeric_max') {
      const actual = parseFloat(data.actual);
      const target = parseFloat(goal.target);
      if (!isNaN(actual) && !isNaN(target) && actual > 0) {
        score = Math.min((target / actual) * 100, 100);
      }
    }

    overallScore += (Number(goal.weightage) / 100) * score;
  });

  const updatedGoalsCount = achievements?.length || 0;
  const totalGoalsCount = goals?.length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in relative">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-3 animate-fade-in min-w-[300px]">
          <span className="material-symbols-outlined bg-primary/10 text-white p-1 rounded-full">check_circle</span>
          <span className="font-bold text-white">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-auto text-white/70 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-surface-container p-8 rounded-2xl border border-outline flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-primary">{currentQuarterInfo.name}</h1>
          <p className="text-slate-700-variant font-body-md mt-2">Log your progress and track achievements against your approved goals.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">checklist</span>
            {updatedGoalsCount} of {totalGoalsCount} goals updated
          </div>
        </div>

        {/* Massive Overall Score */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center bg-surface-container-lowest rounded-full border border-outline shadow-inner">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10"
              className={`transition-all duration-1000 ease-out ${overallScore >= 100 ? 'text-success' : overallScore >= 80 ? 'text-primary' : overallScore >= 50 ? 'text-warning' : 'text-error'}`}
              strokeDasharray="439.8"
              strokeDashoffset={439.8 - (439.8 * Math.min(overallScore, 100)) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center z-10">
            <span className="text-4xl font-bold font-mono text-slate-700 leading-none">{Math.round(Math.min(overallScore, 100))}%</span>
            <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-1">Weighted Score</span>
          </div>
        </div>
      </div>

      {/* GOAL CARDS */}
      <div className="space-y-6">
        {goals?.map(goal => {
          const data = formData[goal.id];
          if (!data) return null;

          const score = calculateGoalScore(goal.uom, goal.target, goal.target_date, data.actual, data.actual_date, data.isZero);
          const barColor = score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-error';

          const isPending = upsertAchievementMutation.isPending && upsertAchievementMutation.variables?.goal_id === goal.id;

          return (
            <div key={goal.id} className="bg-surface-container rounded-2xl border border-outline overflow-hidden flex flex-col xl:flex-row group transition-all hover:border-outline">

              {/* Left Side: Goal Info & Progress */}
              <div className="flex-1 p-6 border-b xl:border-b-0 xl:border-r border-outline">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-surface-variant text-slate-700-variant text-xs font-bold rounded-md uppercase tracking-wider">
                    {goal.thrust_area}
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">scale</span>
                    Weight: {goal.weightage}%
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-700">{goal.title}</h3>
                <p className="text-slate-700-variant text-sm mt-2">{goal.description}</p>

                <div className="mt-6 p-4 bg-surface-container-lowest rounded-xl border border-outline">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Computed Score</div>
                    <div className="text-xl font-bold font-mono text-slate-700">{Math.round(Math.min(score, 100))}%</div>
                  </div>
                  <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ease-out ${barColor}`} style={{ width: `${Math.min(score, 100)}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-3 text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">straighten</span> {goal.uom.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">flag</span> Target: <span className="text-slate-700">{goal.uom === 'timeline' ? (goal.target_date ? new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-') : goal.target}</span></span>
                  </div>
                </div>
              </div>

              {/* Right Side: Inputs */}
              <div className="w-full xl:w-[400px] shrink-0 p-6 flex flex-col bg-surface-container-lowest/50">

                <div className="space-y-4 flex-1">

                  {/* Actual Input based on UoM */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Actual Achievement</label>
                    {goal.uom === 'numeric_min' || goal.uom === 'numeric_max' ? (
                      <input
                        type="number"
                        value={data.actual} onChange={(e) => handleFieldChange(goal.id, 'actual', e.target.value)}
                        className="w-full bg-surface-variant border border-transparent rounded-lg px-4 py-2.5 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                        placeholder={`Enter current value (Target: ${goal.target})`}
                      />
                    ) : goal.uom === 'timeline' ? (
                      <input
                        type="date"
                        value={data.actual_date} onChange={(e) => handleFieldChange(goal.id, 'actual_date', e.target.value)}
                        className="w-full bg-surface-variant border border-transparent rounded-lg px-4 py-2.5 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      <label className="flex items-center gap-3 p-3 bg-surface-variant rounded-lg cursor-pointer hover:bg-surface-variant/80 transition-colors">
                        <input
                          type="checkbox"
                          checked={data.isZero} onChange={(e) => handleFieldChange(goal.id, 'isZero', e.target.checked)}
                          className="w-5 h-5 rounded border-outline text-primary focus:ring-primary bg-background"
                        />
                        <span className="text-slate-700 font-medium">Achievement is Zero (Success)</span>
                      </label>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Status</label>
                    <select
                      value={data.status} onChange={(e) => handleFieldChange(goal.id, 'status', e.target.value)}
                      className="w-full bg-surface-variant border border-transparent rounded-lg px-4 py-2.5 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-medium"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="on_track">On Track</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Employee Note (Optional)</label>
                    <textarea
                      rows="2"
                      value={data.employee_note} onChange={(e) => handleFieldChange(goal.id, 'employee_note', e.target.value)}
                      className="w-full bg-surface-variant border border-transparent rounded-lg px-4 py-2.5 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary resize-none text-sm"
                      placeholder="Add context for your manager..."
                    ></textarea>
                  </div>

                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleSave(goal)}
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] disabled:opacity-50 disabled:shadow-none"
                  >
                    {isPending ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                    Save Check-in
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
