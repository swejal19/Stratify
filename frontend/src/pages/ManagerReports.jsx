import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useActiveCycle } from '../hooks/useGoals';
import { calculateGoalScore } from '../utils/achievementUtils';

// Self-contained data fetch hook for Manager Reports
const useManagerReportData = (activeCycleId, currentUserId) => {
  return useQuery({
    queryKey: ['managerReport', activeCycleId, currentUserId],
    enabled: !!activeCycleId && !!currentUserId,
    queryFn: async () => {
      // Step 1: Fetch team members (employees who report to this manager)
      const { data: teamMembers, error: tmErr } = await supabase
        .from('profiles')
        .select('id, full_name, department')
        .eq('manager_id', currentUserId);
      if (tmErr) throw tmErr;

      if (!teamMembers || teamMembers.length === 0) {
        return { teamMembers: [], sheets: [], goals: [], achievements: [] };
      }

      // Step 2: Fetch their goal sheets for active cycle
      const teamIds = teamMembers.map(t => t.id);
      const { data: sheets, error: sErr } = await supabase
        .from('goal_sheets')
        .select('id, employee_id')
        .eq('cycle_id', activeCycleId)
        .in('employee_id', teamIds);
      if (sErr) throw sErr;

      if (!sheets || sheets.length === 0) {
        return { teamMembers, sheets: [], goals: [], achievements: [] };
      }

      // Step 3: Fetch goals
      const sheetIds = sheets.map(s => s.id);
      const { data: goals, error: gErr } = await supabase
        .from('goals')
        .select('id, sheet_id, title, uom, target, target_date, weightage, thrust_area')
        .in('sheet_id', sheetIds);
      if (gErr) throw gErr;

      if (!goals || goals.length === 0) {
        return { teamMembers, sheets, goals: [], achievements: [] };
      }

      // Step 4: Fetch achievements — NO cycle_id filter, just goal_id
      const goalIds = goals.map(g => g.id);
      const { data: achievements, error: aErr } = await supabase
        .from('achievements')
        .select('id, goal_id, quarter, actual, actual_date, status')
        .in('goal_id', goalIds);
      if (aErr) throw aErr;
      return { teamMembers, sheets, goals, achievements: achievements || [] };
    }
  });
};

export const ManagerReports = () => {
  const { user } = useAuth();
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: reportData, isLoading: dataLoading } = useManagerReportData(cycle?.id, user?.id);

  const isLoading = cycleLoading || dataLoading;

  // --- Helpers ---
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
    if (goal.uom === 'zero') return ach.actual === 0 ? 'Yes ✓' : 'No';
    return ach.actual !== null && ach.actual !== undefined ? ach.actual : '--';
  };

  const calcQScore = (ach, goal) => {
    if (!ach) return null;
    const isZero = ach.actual === 0 && goal.uom === 'zero';
    const raw = calculateGoalScore(
      goal.uom, goal.target, goal.target_date,
      ach.actual, ach.actual_date,
      isZero
    );
    return Math.min(raw, 100); // cap at 100%
  };

  const scoreColor = (score) => {
    if (score === null) return '';
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-error';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-8 text-center bg-surface-container rounded-2xl border border-white/5">
        <span className="material-symbols-outlined text-warning text-4xl mb-4">warning</span>
        <h2 className="text-xl font-bold text-on-surface">No Active Cycle</h2>
        <p className="text-on-surface-variant mt-2">There is currently no active performance cycle.</p>
      </div>
    );
  }

  const { teamMembers, sheets, goals, achievements } = reportData || {};

  // Build rows
  const rows = [];
  goals?.forEach(goal => {
    const sheet = sheets?.find(s => s.id === goal.sheet_id);
    if (!sheet) return;

    const employee = teamMembers?.find(t => t.id === sheet.employee_id);
    if (!employee) return;

    // Use Number() coercion for quarter in case Supabase returns string
    const q1 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 1);
    const q2 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 2);
    const q3 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 3);
    const q4 = achievements?.find(a => a.goal_id === goal.id && Number(a.quarter) === 4);

    const s1 = calcQScore(q1, goal);
    const s2 = calcQScore(q2, goal);
    const s3 = calcQScore(q3, goal);
    const s4 = calcQScore(q4, goal);

    const validScores = [s1, s2, s3, s4].filter(s => s !== null);
    const avgQ = validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : null;
    const overall = avgQ !== null ? (Number(goal.weightage) / 100) * avgQ : null;

    rows.push({
      employee: employee.full_name,
      department: employee.department || 'N/A',
      goal: goal.title,
      uom: goal.uom,
      weightage: goal.weightage,
      target: formatTarget(goal),
      q1_actual: formatActual(q1, goal), q1_score: s1,
      q2_actual: formatActual(q2, goal), q2_score: s2,
      q3_actual: formatActual(q3, goal), q3_score: s3,
      q4_actual: formatActual(q4, goal), q4_score: s4,
      overall
    });
  });

  rows.sort((a, b) => a.employee.localeCompare(b.employee));

  const exportCSV = () => {
    if (rows.length === 0) return;
    const headers = ['Employee', 'Department', 'Goal', 'UoM', 'Weightage(%)', 'Target',
      'Q1 Actual', 'Q1 Score(%)', 'Q2 Actual', 'Q2 Score(%)',
      'Q3 Actual', 'Q3 Score(%)', 'Q4 Actual', 'Q4 Score(%)', 'Weighted Score(%)'];
    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.map(escape).join(','),
      ...rows.map(r => [
        r.employee, r.department, r.goal, r.uom, r.weightage, r.target,
        r.q1_actual, r.q1_score !== null ? Math.round(r.q1_score) : '',
        r.q2_actual, r.q2_score !== null ? Math.round(r.q2_score) : '',
        r.q3_actual, r.q3_score !== null ? Math.round(r.q3_score) : '',
        r.q4_actual, r.q4_score !== null ? Math.round(r.q4_score) : '',
        r.overall !== null ? Math.round(r.overall) : ''
      ].map(escape).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TeamReport_${cycle.name}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-full mx-auto space-y-8 pb-32 animate-fade-in relative">

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-on-surface">Team Reports</h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            Goal vs Actual performance across all quarters — {cycle.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-outline">
            <span className="font-bold text-on-surface">{teamMembers?.length || 0}</span> team members ·{' '}
            <span className="font-bold text-on-surface">{rows.length}</span> goals
          </div>
          <button
            onClick={exportCSV}
            disabled={rows.length === 0}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-12 text-center bg-surface-container rounded-2xl border border-white/5">
          <span className="material-symbols-outlined text-outline text-5xl mb-4">description</span>
          <h2 className="text-xl font-bold text-on-surface">No Data Available</h2>
          <p className="text-on-surface-variant mt-2">
            Your team members haven't submitted goal sheets yet, or no achievements have been logged for this cycle.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden shadow-lg flex flex-col h-[72vh]">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[1500px]">
              <thead className="sticky top-0 z-10 bg-surface-container-lowest border-b border-white/10 shadow-sm">
                <tr className="text-xs text-outline font-bold uppercase tracking-wider">
                  <th className="px-4 py-4 bg-surface-container-lowest sticky left-0 z-20 border-r border-white/5">Employee</th>
                  <th className="px-4 py-4 border-r border-white/5">Dept</th>
                  <th className="px-4 py-4 border-r border-white/5">Goal</th>
                  <th className="px-4 py-4">UoM</th>
                  <th className="px-4 py-4">Wt.</th>
                  <th className="px-4 py-4 border-r border-white/5 bg-primary/5">Target</th>
                  <th className="px-4 py-4 bg-surface-variant/30">Q1 Actual</th>
                  <th className="px-4 py-4 bg-surface-variant/30 border-r border-white/5">Q1 Score</th>
                  <th className="px-4 py-4 bg-surface-variant/10">Q2 Actual</th>
                  <th className="px-4 py-4 bg-surface-variant/10 border-r border-white/5">Q2 Score</th>
                  <th className="px-4 py-4 bg-surface-variant/30">Q3 Actual</th>
                  <th className="px-4 py-4 bg-surface-variant/30 border-r border-white/5">Q3 Score</th>
                  <th className="px-4 py-4 bg-surface-variant/10">Q4 Actual</th>
                  <th className="px-4 py-4 bg-surface-variant/10 border-r border-white/5">Q4 Score</th>
                  <th className="px-4 py-4 bg-primary/10 text-primary">Wtd. Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-bold text-on-surface bg-surface-container sticky left-0 z-10 border-r border-white/5">{row.employee}</td>
                    <td className="px-4 py-3 text-on-surface-variant border-r border-white/5">{row.department}</td>
                    <td className="px-4 py-3 text-on-surface-variant border-r border-white/5 max-w-[200px] truncate" title={row.goal}>{row.goal}</td>
                    <td className="px-4 py-3 text-outline text-xs uppercase">{row.uom?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-mono">{row.weightage}%</td>
                    <td className="px-4 py-3 font-mono font-bold text-on-surface border-r border-white/5 bg-primary/5">{row.target || '--'}</td>

                    <td className="px-4 py-3 font-mono bg-surface-variant/30">{row.q1_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-surface-variant/30 border-r border-white/5 ${scoreColor(row.q1_score)}`}>
                      {row.q1_score !== null ? `${Math.round(row.q1_score)}%` : '--'}
                    </td>

                    <td className="px-4 py-3 font-mono bg-surface-variant/10">{row.q2_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-surface-variant/10 border-r border-white/5 ${scoreColor(row.q2_score)}`}>
                      {row.q2_score !== null ? `${Math.round(row.q2_score)}%` : '--'}
                    </td>

                    <td className="px-4 py-3 font-mono bg-surface-variant/30">{row.q3_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-surface-variant/30 border-r border-white/5 ${scoreColor(row.q3_score)}`}>
                      {row.q3_score !== null ? `${Math.round(row.q3_score)}%` : '--'}
                    </td>

                    <td className="px-4 py-3 font-mono bg-surface-variant/10">{row.q4_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-surface-variant/10 border-r border-white/5 ${scoreColor(row.q4_score)}`}>
                      {row.q4_score !== null ? `${Math.round(row.q4_score)}%` : '--'}
                    </td>

                    <td className={`px-4 py-3 font-mono font-bold bg-primary/10 ${scoreColor(row.overall)}`}>
                      {row.overall !== null ? `${Math.round(row.overall)}%` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};