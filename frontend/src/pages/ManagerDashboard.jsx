import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActiveCycle } from '../hooks/useGoals';
import { useTeamMembers } from '../hooks/useManager';
import { getCurrentQuarter } from '../utils/achievementUtils';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: cycle } = useActiveCycle();

  const currentQuarterInfo = getCurrentQuarter(cycle);
  const quarter = currentQuarterInfo.quarter;

  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers(cycle?.id);

  // Fetch check-ins for current quarter
  const { data: checkinsData } = useQuery({
    queryKey: ['managerCheckins', cycle?.id, quarter],
    enabled: !!cycle?.id,
    queryFn: async () => {
      if (!profile?.id) return { checkedInCount: 0 };

      // Get team members
      const { data: team } = await supabase
        .from('profiles')
        .select('id')
        .eq('manager_id', profile.id);

      if (!team || team.length === 0) return { checkedInCount: 0 };

      const teamIds = team.map(t => t.id);

      // Get achievements with manager_comment for this quarter
      const { data: achievements } = await supabase
        .from('achievements')
        .select('goal_id, manager_comment')
        .eq('cycle_id', cycle.id)
        .eq('quarter', quarter)
        .not('manager_comment', 'is', null);

      if (!achievements || achievements.length === 0) return { checkedInCount: 0 };

      // Get goal_ids and find their sheets to get employee_id
      const goalIds = achievements.map(a => a.goal_id);
      const { data: goals } = await supabase
        .from('goals')
        .select('id, sheet_id')
        .in('id', goalIds);

      if (!goals) return { checkedInCount: 0 };

      const sheetIds = [...new Set(goals.map(g => g.sheet_id).filter(Boolean))];
      const { data: sheets } = await supabase
        .from('goal_sheets')
        .select('id, employee_id')
        .in('id', sheetIds);

      if (!sheets) return { checkedInCount: 0 };

      const checkedInEmployeeIds = [...new Set(sheets.map(s => s.employee_id).filter(id => teamIds.includes(id)))];
      return { checkedInCount: checkedInEmployeeIds.length };
    }
  });

  // Calculate stats
  const teamSize = teamMembers?.length || 0;
  const goalsSubmitted = teamMembers?.filter(m => m.goalSheet && m.goalSheet.status !== 'draft').length || 0;
  const goalsApproved = teamMembers?.filter(m => m.goalSheet && (m.goalSheet.status === 'locked' || m.goalSheet.status === 'approved')).length || 0;
  const checkInsDone = checkinsData?.checkedInCount || 0;

  // Get recent team activity
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', class: 'bg-surface-variant text-slate-700-variant' };
      case 'submitted':
        return { label: 'Submitted', class: 'bg-tertiary/20 text-tertiary' };
      case 'locked':
        return { label: 'Approved', class: 'bg-success/20 text-success' };
      case 'approved':
        return { label: 'Approved', class: 'bg-success/20 text-success' };
      case 'rework':
        return { label: 'Needs Revision', class: 'bg-warning/20 text-warning' };
      default:
        return { label: 'Draft', class: 'bg-surface-variant text-slate-700-variant' };
    }
  };

  const isLoading = teamLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-slate-700">Welcome back, {profile?.full_name || 'Manager'}</h1>
          <p className="text-slate-700-variant font-body-md mt-1">Here is your team overview for {currentQuarterInfo.name}.</p>
        </div>
        {cycle && (
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Active Cycle: {cycle.name}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Team Size */}
        <div className="bg-surface-container p-6 rounded-2xl border border-outline relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <h3 className="text-4xl font-mono font-bold text-slate-700 mb-1">{teamSize}</h3>
          <p className="text-slate-700-variant text-sm font-bold uppercase tracking-wider">Team Size</p>
        </div>

        {/* Goals Submitted */}
        <div className="bg-surface-container p-6 rounded-2xl border border-outline relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">send</span>
            </div>
          </div>
          <h3 className="text-4xl font-mono font-bold text-slate-700 mb-1">{goalsSubmitted}</h3>
          <p className="text-slate-700-variant text-sm font-bold uppercase tracking-wider">Goals Submitted</p>
          <div className="h-1.5 w-full bg-surface-variant rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-tertiary" style={{ width: `${teamSize > 0 ? (goalsSubmitted / teamSize) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Goals Approved */}
        <div className="bg-surface-container p-6 rounded-2xl border border-outline relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-success/20 text-success flex items-center justify-center">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
          <h3 className="text-4xl font-mono font-bold text-slate-700 mb-1">{goalsApproved}</h3>
          <p className="text-slate-700-variant text-sm font-bold uppercase tracking-wider">Goals Approved</p>
          <div className="h-1.5 w-full bg-surface-variant rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-success" style={{ width: `${goalsSubmitted > 0 ? (goalsApproved / goalsSubmitted) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Check-ins Done */}
        <div className="bg-surface-container p-6 rounded-2xl border border-outline relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-warning/20 text-warning flex items-center justify-center">
              <span className="material-symbols-outlined">fact_check</span>
            </div>
          </div>
          <h3 className="text-4xl font-mono font-bold text-slate-700 mb-1">{checkInsDone}</h3>
          <p className="text-slate-700-variant text-sm font-bold uppercase tracking-wider">Check-ins Done</p>
          <div className="h-1.5 w-full bg-surface-variant rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-warning" style={{ width: `${teamSize > 0 ? (checkInsDone / teamSize) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-surface-container rounded-2xl border border-outline p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/manager/team')}
            className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            <span className="material-symbols-outlined">group</span>
            Review Team Goals
          </button>
          <button
            onClick={() => navigate('/manager/checkins')}
            className="bg-warning text-on-warning px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-warning/90 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
          >
            <span className="material-symbols-outlined">fact_check</span>
            Start Check-ins
          </button>
          <button
            onClick={() => navigate('/manager/reports')}
            className="bg-tertiary text-on-tertiary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-tertiary/90 transition-all shadow-[0_0_15px_rgba(162,28,175,0.2)]"
          >
            <span className="material-symbols-outlined">assessment</span>
            View Reports
          </button>
        </div>
      </div>

      {/* Recent Team Activity */}
      <div className="bg-surface-container rounded-2xl border border-outline overflow-hidden">
        <div className="p-6 border-b border-outline flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-700">Recent Team Activity</h3>
          <span className="material-symbols-outlined text-slate-400">groups</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Goals</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teamMembers?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-700-variant">
                    No team members found. Assign employees to your manager profile to get started.
                  </td>
                </tr>
              ) : (
                teamMembers?.map((member) => {
                  const badge = getStatusBadge(member.goalSheet?.status || 'draft');
                  return (
                    <tr key={member.id} className="hover:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                            {member.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700">{member.full_name}</p>
                            <p className="text-xs text-slate-700-variant">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700-variant">{member.department || '--'}</td>
                      <td className="px-6 py-4 text-slate-700-variant font-mono">{member.totalWeightage || 0}%</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
