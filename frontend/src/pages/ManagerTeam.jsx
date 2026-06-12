import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveCycle } from '../hooks/useGoals';
import { useTeamMembers } from '../hooks/useManager';
import { PushGoalModal } from '../components/shared/PushGoalModal';

export const ManagerTeam = () => {
  const navigate = useNavigate();
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers(cycle?.id);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);

  const isLoading = cycleLoading || teamLoading;

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

  const submittedCount = teamMembers?.filter(m => m.goalSheet?.status === 'submitted' || m.goalSheet?.status === 'locked' || m.goalSheet?.status === 'approved').length || 0;
  const totalCount = teamMembers?.length || 0;

  // Status Badge Config
  const getStatusBadge = (s) => {
    switch(s) {
      case 'submitted': return <span className="px-3 py-1 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-full text-xs font-bold uppercase tracking-wider">Submitted</span>;
      case 'approved': return <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'locked': return <span className="px-3 py-1 bg-surface-variant text-slate-700 border border-outline rounded-full text-xs font-bold uppercase tracking-wider">Locked</span>;
      case 'rework': return <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-bold uppercase tracking-wider">Rework</span>;
      default: return <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">Draft / Not Started</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in relative">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-slate-700">Team Goals</h1>
          <p className="text-slate-700-variant font-body-md mt-1">{cycle.name} Overview</p>
        </div>
        <button 
          onClick={() => setIsPushModalOpen(true)}
          className="bg-tertiary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-tertiary/90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
          Push Goal
        </button>
      </div>

      {/* Summary Bar */}
      <div className="bg-surface-container p-6 rounded-2xl border border-outline flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700">Submission Status</h2>
            <p className="text-slate-700-variant text-sm mt-1">
              <strong className="text-slate-700">{submittedCount}</strong> out of <strong className="text-slate-700">{totalCount}</strong> team members have submitted their goals.
            </p>
          </div>
        </div>
        
        {/* Progress Circle Visual */}
        <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline overflow-hidden">
           <div className="absolute inset-0 bg-primary/20" style={{ height: `${totalCount === 0 ? 0 : (submittedCount / totalCount) * 100}%`, bottom: 0, top: 'auto' }} />
           <span className="relative font-bold text-slate-700 z-10">{totalCount === 0 ? 0 : Math.round((submittedCount/totalCount)*100)}%</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container rounded-2xl border border-outline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline">
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Name</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Department</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Status</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Weightage</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Submitted At</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teamMembers?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-700-variant">
                    No team members found. Check your profile settings.
                  </td>
                </tr>
              ) : (
                teamMembers?.map((member, idx) => {
                  const status = member.goalSheet?.status || 'draft';
                  const canReview = status === 'submitted' || status === 'locked' || status === 'approved' || status === 'rework';
                  
                  return (
                    <tr 
                      key={member.id} 
                      className="hover:hover:bg-slate-50 transition-colors animate-fade-in group"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                            {member.full_name?.charAt(0) || '?'}
                          </div>
                          <span className="font-bold text-slate-700">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700-variant">{member.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-medium ${member.totalWeightage === 100 ? 'text-success' : 'text-warning'}`}>
                          {member.totalWeightage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700-variant">
                        {member.goalSheet?.submitted_at ? new Date(member.goalSheet.submitted_at).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/manager/team/${member.id}`)}
                          disabled={!canReview}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            status === 'submitted' 
                            ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                            : canReview
                            ? 'bg-surface-variant text-slate-700 hover:bg-slate-200'
                            : 'opacity-50 cursor-not-allowed text-slate-400'
                          }`}
                        >
                          {status === 'submitted' ? 'Review Goals' : 'View'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* PUSH GOAL MODAL */}
      <PushGoalModal 
        isOpen={isPushModalOpen} 
        onClose={() => setIsPushModalOpen(false)} 
        employees={teamMembers || []} 
      />

    </div>
  );
};
