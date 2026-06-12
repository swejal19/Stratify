import React, { useState } from 'react';
import { useActiveCycle } from '../hooks/useGoals';
import { useTeamCheckins, useSaveCheckinCommentMutation } from '../hooks/useManager';
import { getCurrentQuarter, calculateGoalScore } from '../utils/achievementUtils';

export const ManagerCheckins = () => {
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();

  const currentQuarterInfo = getCurrentQuarter(cycle);
  const quarter = currentQuarterInfo.quarter;

  const { data: teamMembers, isLoading: teamLoading } = useTeamCheckins(cycle?.id, quarter);
  const saveCommentMutation = useSaveCheckinCommentMutation();

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

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
        <h2 className="text-xl font-bold text-slate-700">No Active Cycle</h2>
      </div>
    );
  }

  // Calculate metrics per member
  const membersWithMetrics = teamMembers?.map(member => {
    let quarterScore = 0;
    let achievementsCount = 0;
    const validAchievements = [];

    member.goalsData.forEach(({ goal, achievement }) => {
      if (achievement) {
        achievementsCount++;
        validAchievements.push(achievement.id);
        const rawScore = calculateGoalScore(
          goal.uom, goal.target, goal.target_date,
          achievement.actual, achievement.actual_date,
          achievement.actual === 0 && goal.uom === 'zero'
        );
        const score = Math.min(rawScore, 100);
        quarterScore += (Number(goal.weightage) / 100) * score;
      }
    });

    return {
      ...member,
      quarterScore: Math.round(quarterScore),
      achievementsCount,
      validAchievements,
      totalGoals: member.goalsData.length
    };
  }) || [];

  const checkedInCount = membersWithMetrics.filter(m => m.hasManagerComment).length;
  const totalCount = membersWithMetrics.length;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenPanel = (member) => {
    setSelectedEmployee(member);
    setCommentText(member.existingComment || '');
  };

  const handleClosePanel = () => {
    setSelectedEmployee(null);
    setCommentText('');
  };

  const handleSaveComment = async () => {
    if (!commentText.trim()) return;

    try {
      await saveCommentMutation.mutateAsync({
        cycleId: cycle.id,
        quarter: quarter,
        achievementsIds: selectedEmployee.validAchievements,
        comment: commentText
      });
      showToast('Check-in feedback saved successfully');

      // Update local state to reflect UI change immediately
      selectedEmployee.hasManagerComment = true;
      selectedEmployee.existingComment = commentText;

    } catch (err) {
      alert(err.message || 'Failed to save comment. Does the employee have logged achievements?');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in relative">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[200] bg-success/20 border border-success/30 text-success px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-display-md font-bold text-slate-700">Quarterly Check-ins</h1>
        <p className="text-slate-700-variant font-body-md mt-1">Review team progress and provide feedback.</p>
      </div>

      {/* Summary Bar */}
      <div className="bg-surface-container p-6 rounded-2xl border border-outline flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">rate_review</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700">{currentQuarterInfo.name}</h2>
            <p className="text-slate-700-variant text-sm mt-1">
              <strong className="text-slate-700">{checkedInCount}</strong> of <strong className="text-slate-700">{totalCount}</strong> team members checked in this quarter.
            </p>
          </div>
        </div>

        {/* Progress Circle Visual */}
        <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 transition-all duration-1000" style={{ height: `${totalCount === 0 ? 0 : (checkedInCount / totalCount) * 100}%`, bottom: 0, top: 'auto' }} />
          <span className="relative font-bold text-slate-700 z-10">{totalCount === 0 ? 0 : Math.round((checkedInCount / totalCount) * 100)}%</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container rounded-2xl border border-outline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline">
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Employee</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Goals</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Q{quarter} Score</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm">Check-in Status</th>
                <th className="px-6 py-4 font-label-lg font-bold text-slate-700-variant uppercase tracking-wider text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {membersWithMetrics?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-700-variant">
                    No team members found.
                  </td>
                </tr>
              ) : (
                membersWithMetrics?.map((member, idx) => (
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
                        <div>
                          <div className="font-bold text-slate-700">{member.full_name}</div>
                          <div className="text-xs text-slate-700-variant">{member.department || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700-variant">{member.achievementsCount} / {member.totalGoals} Updated</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold ${member.quarterScore >= 80 ? 'text-success' : member.quarterScore >= 50 ? 'text-warning' : 'text-error'}`}>
                        {member.quarterScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.hasManagerComment ? (
                        <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max">
                          <span className="material-symbols-outlined text-[14px]">done_all</span> Done
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max">
                          <span className="material-symbols-outlined text-[14px]">pending_actions</span> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenPanel(member)}
                        className="px-4 py-2 rounded-lg font-bold text-sm transition-all bg-surface-variant text-slate-700 hover:bg-slate-200"
                      >
                        {member.hasManagerComment ? 'View Check-in' : 'Start Check-in'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECK-IN DRAWER / SIDE PANEL */}
      {selectedEmployee && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-fade-in"
            onClick={handleClosePanel}
          ></div>

          {/* Sliding Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-surface-container-lowest border-l border-outline z-[110] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-in-right">

            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-outline bg-surface-container flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl border border-primary/30">
                  {selectedEmployee.full_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-700">{selectedEmployee.full_name}</h2>
                  <p className="text-slate-700-variant text-sm">{selectedEmployee.department} &middot; {currentQuarterInfo.name}</p>
                </div>
              </div>
              <button onClick={handleClosePanel} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drawer Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">

              {/* Overall Score */}
              <div className="bg-surface-container p-6 rounded-xl border border-outline flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-700">Overall Weighted Score</h3>
                  <p className="text-sm text-slate-700-variant">Computed from {selectedEmployee.achievementsCount} logged achievements.</p>
                </div>
                <div className={`text-3xl font-mono font-bold ${selectedEmployee.quarterScore >= 80 ? 'text-success' : selectedEmployee.quarterScore >= 50 ? 'text-warning' : 'text-error'}`}>
                  {selectedEmployee.quarterScore}%
                </div>
              </div>

              {/* Goal List */}
              <div className="space-y-4">
                <h3 className="font-label-lg text-slate-400 uppercase tracking-wider font-bold">Goal Breakdown</h3>

                {selectedEmployee.goalsData.length === 0 && (
                  <p className="text-slate-700-variant">No goals found for this employee.</p>
                )}

                {selectedEmployee.goalsData.map(({ goal, achievement }) => {
                  let score = 0;
                  if (achievement) {
                    score = calculateGoalScore(
                      goal.uom, goal.target, goal.target_date,
                      achievement.actual, achievement.actual_date,
                      achievement.actual === 0 && goal.uom === 'zero'
                    );
                  }
                  const barColor = score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-error';

                  return (
                    <div key={goal.id} className="bg-surface-container rounded-xl p-5 border border-outline">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-slate-700 flex-1 pr-4">{goal.title}</div>
                        <div className="text-right shrink-0">
                          <span className="text-xs uppercase font-bold text-slate-400">Weight: {goal.weightage}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 bg-surface-container-lowest p-3 rounded-lg text-sm">
                        <div>
                          <span className="text-slate-400 block text-xs">Target</span>
                          <span className="font-mono text-slate-700">{goal.uom === 'timeline' ? new Date(goal.target_date).toLocaleDateString() : goal.target}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-xs">Actual</span>
                          <span className="font-mono text-slate-700">
                            {!achievement ? '--' : goal.uom === 'timeline' && achievement.actual_date ? new Date(achievement.actual_date).toLocaleDateString() : achievement.actual}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-end mb-1 text-xs">
                          <span className="text-slate-700-variant">Computed Score</span>
                          <span className="font-bold font-mono">{Math.round(score)}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden flex">
                          <div className={`h-full ${barColor}`} style={{ width: `${Math.min(score, 100)}%` }} />
                        </div>
                      </div>

                      {achievement?.employee_note && (
                        <div className="mt-4 p-3 bg-primary/5 border-l-2 border-primary rounded-r-lg text-sm">
                          <span className="font-bold text-primary block mb-1">Employee Note:</span>
                          <span className="text-slate-700-variant">{achievement.employee_note}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Manager Feedback Form */}
              <div className="space-y-4 pt-4 border-t border-outline">
                <h3 className="font-label-lg text-slate-400 uppercase tracking-wider font-bold">Manager Feedback</h3>

                {selectedEmployee.validAchievements.length === 0 ? (
                  <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg text-warning text-sm">
                    This employee has not logged any achievements yet this quarter. You cannot submit feedback until they log progress.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add your check-in feedback here..."
                      rows="5"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 px-4 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    ></textarea>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleClosePanel}
                        className="px-5 py-2.5 rounded-lg font-bold text-slate-700-variant hover:bg-surface-variant transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveComment}
                        disabled={saveCommentMutation.isPending || !commentText.trim()}
                        className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:shadow-none"
                      >
                        {saveCommentMutation.isPending ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                        Mark Check-in Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};
