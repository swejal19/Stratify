import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useActiveCycle, useGoals, useEditGoalMutation } from '../hooks/useGoals';
import { useEmployeeGoalSheet, useApproveGoalsMutation, useReturnForReworkMutation } from '../hooks/useManager';

export const ManagerApproval = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: sheetData, isLoading: sheetLoading } = useEmployeeGoalSheet(employeeId, cycle?.id);
  const { data: goals, isLoading: goalsLoading } = useGoals(sheetData?.sheet?.id);

  const editGoalMutation = useEditGoalMutation();
  const approveGoalsMutation = useApproveGoalsMutation();
  const returnForReworkMutation = useReturnForReworkMutation();

  const [toastMessage, setToastMessage] = useState(null);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [reworkComment, setReworkComment] = useState('');

  // Local state for inline editing to prevent jumpy UI while typing
  const [editingTarget, setEditingTarget] = useState({ id: null, value: '' });
  const [editingWeightage, setEditingWeightage] = useState({ id: null, value: '' });

  const isLoading = cycleLoading || sheetLoading || goalsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  const profile = sheetData?.profile;
  const sheet = sheetData?.sheet;

  if (!profile || !sheet) {
    return (
      <div className="p-8 text-center bg-surface-container rounded-2xl border border-outline">
        <h2 className="text-xl font-bold text-slate-700">Goal Sheet Not Found</h2>
        <button onClick={() => navigate('/manager/team')} className="mt-4 text-primary hover:underline">Return to Team</button>
      </div>
    );
  }

  const status = sheet.status;
  const isEditable = status === 'submitted'; // Managers can only edit/approve if submitted

  const totalWeightage = goals?.reduce((sum, g) => {
    // If we are currently inline editing this goal's weightage, use the edited value for the running total
    if (editingWeightage.id === g.id) {
      return sum + (Number(editingWeightage.value) || 0);
    }
    return sum + (Number(g.weightage) || 0);
  }, 0) || 0;
  
  const isComplete = totalWeightage === 100;
  const isOver = totalWeightage > 100;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Inline Edit Handlers ---
  const handleTargetBlur = async (goal) => {
    const isTimeline = goal.uom === 'timeline';
    const originalValue = isTimeline ? (goal.target_date || '') : String(goal.target || '');
    
    if (editingTarget.id === goal.id && editingTarget.value !== originalValue) {
      try {
        const payload = isTimeline 
          ? { id: goal.id, target_date: editingTarget.value, target: null } 
          : { id: goal.id, target: Number(editingTarget.value) || 0, target_date: null };
        await editGoalMutation.mutateAsync(payload);
        showToast('Target updated');
      } catch (err) {
        alert('Failed to update target');
      }
    }
    setEditingTarget({ id: null, value: '' });
  };

  const handleWeightageBlur = async (goal) => {
    if (editingWeightage.id === goal.id && editingWeightage.value !== String(goal.weightage)) {
      try {
        await editGoalMutation.mutateAsync({ id: goal.id, weightage: Number(editingWeightage.value) });
        showToast('Weightage updated');
      } catch (err) {
        alert('Failed to update weightage');
      }
    }
    setEditingWeightage({ id: null, value: '' });
  };

  // --- Action Handlers ---
  const handleApprove = async () => {
    if (!isComplete) {
      alert('Total weightage must be exactly 100% before approving.');
      return;
    }
    if (confirm('Are you sure? Goals will be locked after approval and the employee cannot make further edits.')) {
      try {
        await approveGoalsMutation.mutateAsync(sheet.id);
        navigate('/manager/team');
      } catch (err) {
        alert('Failed to approve goals.');
      }
    }
  };

  const handleReworkSubmit = async (e) => {
    e.preventDefault();
    if (!reworkComment.trim()) return;
    try {
      await returnForReworkMutation.mutateAsync({ sheetId: sheet.id, comment: reworkComment });
      setIsReworkModalOpen(false);
      navigate('/manager/team');
    } catch (err) {
      alert('Failed to return for rework.');
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

      {/* Header Section */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/manager/team')} className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 text-sm font-bold">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Team
        </button>
      </div>

      <div className="bg-surface-container p-8 rounded-2xl border border-outline flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl border border-primary/30">
            {profile.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-display-md font-bold text-slate-700">{profile.full_name}</h1>
            <p className="text-slate-700-variant font-body-md mt-1">{profile.department} &middot; {cycle.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Submitted At</p>
          <p className="text-slate-700 font-mono">{sheet.submitted_at ? new Date(sheet.submitted_at).toLocaleString() : 'N/A'}</p>
        </div>
      </div>

      {/* Weightage Tracker */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-700">Total Weightage</h2>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold transition-colors ${isComplete ? 'text-success' : isOver ? 'text-error' : 'text-primary'}`}>
              {totalWeightage}%
            </span>
          </div>
        </div>
        
        <div className="h-4 bg-surface-variant rounded-full overflow-hidden flex">
          <div 
            className={`h-full transition-all duration-500 ease-out ${isComplete ? 'bg-success' : isOver ? 'bg-error' : 'bg-primary'}`}
            style={{ width: `${Math.min(totalWeightage, 100)}%` }}
          />
        </div>
        {isOver && <p className="text-error text-sm mt-2 font-medium">Warning: Weightage exceeds 100%. Adjust before approving.</p>}
        {!isComplete && !isOver && <p className="text-warning text-sm mt-2 font-medium">Warning: Weightage does not equal exactly 100%.</p>}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals?.map(goal => (
          <div key={goal.id} className="bg-surface-container p-6 rounded-2xl border border-outline flex flex-col md:flex-row gap-6">
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-surface-variant text-slate-700-variant text-xs font-bold rounded-md uppercase tracking-wider">
                  {goal.thrust_area}
                </span>
                {goal.is_shared && (
                  <span className="px-3 py-1 bg-tertiary/20 text-tertiary text-xs font-bold rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">share</span>
                    Shared
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-700">{goal.title}</h3>
                <p className="text-slate-700-variant text-sm mt-1">{goal.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400 pt-2">
                <span className="material-symbols-outlined text-[18px]">straighten</span>
                Type: <span className="text-slate-700-variant font-medium">{goal.uom?.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="flex md:flex-col gap-4 shrink-0 bg-surface-container-lowest p-4 rounded-xl border border-outline min-w-[200px]">
              
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-slate-400 font-bold uppercase">Target</label>
                {isEditable ? (
                  <input 
                    type={goal.uom === 'timeline' ? "date" : "number"}
                    className="bg-surface-variant border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-md px-3 py-2 text-slate-700 font-mono transition-all w-full"
                    value={editingTarget.id === goal.id ? editingTarget.value : (goal.uom === 'timeline' ? (goal.target_date || '') : (goal.target || ''))}
                    onChange={(e) => setEditingTarget({ id: goal.id, value: e.target.value })}
                    onFocus={() => setEditingTarget({ id: goal.id, value: goal.uom === 'timeline' ? (goal.target_date || '') : String(goal.target || '') })}
                    onBlur={() => handleTargetBlur(goal)}
                  />
                ) : (
                  <span className="text-slate-700 font-mono px-3 py-2">
                    {goal.uom === 'timeline' 
                      ? (goal.target_date ? new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-GB') : '--')
                      : (goal.uom === 'zero' ? 'Zero' : goal.target)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-slate-400 font-bold uppercase">Weightage (%)</label>
                {isEditable ? (
                  <div className="relative">
                    <input 
                      type="number"
                      className="bg-surface-variant border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-md px-3 py-2 text-slate-700 font-mono transition-all w-full pr-8"
                      value={editingWeightage.id === goal.id ? editingWeightage.value : goal.weightage}
                      onChange={(e) => setEditingWeightage({ id: goal.id, value: e.target.value })}
                      onFocus={() => setEditingWeightage({ id: goal.id, value: String(goal.weightage) })}
                      onBlur={() => handleWeightageBlur(goal)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400-variant font-mono">%</span>
                  </div>
                ) : (
                  <span className="text-slate-700 font-mono px-3 py-2">{goal.weightage}%</span>
                )}
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* STICKY FOOTER ACTIONS */}
      {isEditable && (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline p-6 flex justify-end gap-4 z-50">
          <button
            onClick={() => setIsReworkModalOpen(true)}
            disabled={approveGoalsMutation.isPending || returnForReworkMutation.isPending}
            className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-warning/30 text-warning hover:bg-warning/10 transition-colors"
          >
            <span className="material-symbols-outlined">edit_note</span>
            Return for Rework
          </button>
          <button
            onClick={handleApprove}
            disabled={!isComplete || approveGoalsMutation.isPending || returnForReworkMutation.isPending}
            className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-success text-on-primary hover:bg-success/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {approveGoalsMutation.isPending ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">verified</span>}
            Approve Goals
          </button>
        </div>
      )}

      {/* REWORK MODAL */}
      {isReworkModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-warning/20 bg-warning/10 flex items-center gap-3">
              <span className="material-symbols-outlined text-warning">warning</span>
              <h2 className="text-xl font-bold text-warning">Return for Rework</h2>
            </div>

            <div className="p-6">
              <form id="reworkForm" onSubmit={handleReworkSubmit} className="space-y-4">
                <p className="text-slate-700-variant text-sm">
                  Please provide feedback on what needs to be changed. This will unlock the goal sheet for the employee to edit and resubmit.
                </p>
                <div className="space-y-2">
                  <label className="font-label-md text-slate-700 block">Manager Feedback <span className="text-error">*</span></label>
                  <textarea 
                    required 
                    value={reworkComment} 
                    onChange={(e) => setReworkComment(e.target.value)} 
                    rows="4"
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-slate-700 focus:border-warning focus:ring-1 focus:ring-warning"
                    placeholder="E.g., Please increase the target for Q3 Revenue to match team objectives..."
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-outline bg-surface-container flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsReworkModalOpen(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-slate-700-variant hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" form="reworkForm"
                disabled={returnForReworkMutation.isPending || !reworkComment.trim()}
                className="bg-warning hover:bg-warning/90 text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {returnForReworkMutation.isPending ? 'Processing...' : 'Send to Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
