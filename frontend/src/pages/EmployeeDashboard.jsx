import React, { useState } from 'react';
import { 
  useActiveCycle, 
  useGoalSheet, 
  useGoals, 
  useAddGoalMutation, 
  useDeleteGoalMutation, 
  useEditGoalMutation,
  useSubmitSheetMutation 
} from '../hooks/useGoals';

export const EmployeeDashboard = () => {
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: sheet, isLoading: sheetLoading } = useGoalSheet(cycle?.id);
  const { data: goals, isLoading: goalsLoading } = useGoals(sheet?.id);
  
  const addGoalMutation = useAddGoalMutation();
  const editGoalMutation = useEditGoalMutation();
  const deleteGoalMutation = useDeleteGoalMutation();
  const submitSheetMutation = useSubmitSheetMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [thrustArea, setThrustArea] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uomType, setUomType] = useState('numeric_min');
  const [targetValue, setTargetValue] = useState('');
  const [weightage, setWeightage] = useState('');

  const isLoading = cycleLoading || sheetLoading || goalsLoading;

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
        <p className="text-on-surface-variant mt-2">There is currently no active goal setting cycle open.</p>
      </div>
    );
  }

  // Calculate Weightage
  const totalWeightage = goals?.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0) || 0;
  const isComplete = totalWeightage === 100;
  const isOver = totalWeightage > 100;
  
  const status = sheet?.status || 'draft';
  const isEditable = status === 'draft' || status === 'rework';
  const canSubmit = isEditable && isComplete && goals?.length > 0;

  // Modal Math Logic
  const currentGoalWeightage = editingGoalId ? Number(goals?.find(g => g.id === editingGoalId)?.weightage || 0) : 0;
  const remainingWeightage = 100 - totalWeightage + currentGoalWeightage;
  const isOverWeightage = Number(weightage) > remainingWeightage;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingGoalId(null);
    setThrustArea('');
    setTitle('');
    setDescription('');
    setUomType('numeric_min');
    setTargetValue('');
    setWeightage('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoalId(goal.id);
    setThrustArea(goal.thrust_area);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setUomType(goal.uom || 'numeric_min');
    setTargetValue(goal.uom === 'timeline' ? (goal.target_date || '') : (goal.target || ''));
    setWeightage(goal.weightage || '');
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!sheet?.id) return;
    
    try {
      const goalData = {
        sheet_id: sheet.id,
        thrust_area: thrustArea,
        title,
        description,
        uom: uomType,
        weightage: Number(weightage) || 10,
        is_shared: false
      };

      if (uomType === 'timeline') {
        goalData.target_date = targetValue;
        goalData.target = null;
      } else {
        goalData.target = Number(targetValue) || 0;
        goalData.target_date = null;
      }

      if (editingGoalId) {
        await editGoalMutation.mutateAsync({ id: editingGoalId, ...goalData });
        showToast('Goal updated successfully');
      } else {
        await addGoalMutation.mutateAsync(goalData);
        showToast('Goal added successfully');
      }
      
      setIsModalOpen(false);
      
      // Reset Form
      setThrustArea('');
      setTitle('');
      setDescription('');
      setUomType('numeric_min');
      setTargetValue('');
      setWeightage('');
    } catch (err) {
      alert('Failed to add goal');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoalMutation.mutateAsync(id);
        showToast('Goal deleted');
      } catch (err) {
        alert('Failed to delete goal');
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await submitSheetMutation.mutateAsync(sheet.id);
      showToast('Goals Submitted for Approval');
    } catch (err) {
      alert('Failed to submit goals');
    }
  };

  // Status Badge Config
  const getStatusConfig = (s) => {
    switch(s) {
      case 'submitted': return { color: 'text-tertiary bg-tertiary/10 border-tertiary/20', label: 'Submitted' };
      case 'approved': return { color: 'text-success bg-success/10 border-success/20', label: 'Approved' };
      case 'locked': return { color: 'text-on-surface bg-surface-variant border-outline', label: 'Locked' };
      case 'rework': return { color: 'text-warning bg-warning/10 border-warning/20', label: 'Rework Required' };
      default: return { color: 'text-primary bg-primary/10 border-primary/20', label: 'Draft' };
    }
  };
  const statusConfig = getStatusConfig(status);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-success/20 border border-success/30 text-success px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP SECTION: Status Bar */}
      <div className="bg-surface-container p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-on-surface">{cycle.name}</h1>
          <p className="text-on-surface-variant font-body-md mt-1">Goal Setting & Tracking</p>
        </div>
        <div className={`px-4 py-2 rounded-full border text-sm font-bold tracking-wider uppercase ${statusConfig.color} flex items-center gap-2`}>
          <span className="w-2 h-2 rounded-full bg-current"></span>
          {statusConfig.label}
        </div>
      </div>

      {/* Banners */}
      {status === 'rework' && sheet?.manager_comment && (
        <div className="bg-warning/10 border border-warning/30 p-4 rounded-xl flex items-start gap-4">
          <span className="material-symbols-outlined text-warning mt-0.5">warning</span>
          <div>
            <h3 className="text-warning font-bold">Manager Feedback</h3>
            <p className="text-warning/80 mt-1">{sheet.manager_comment}</p>
          </div>
        </div>
      )}

      {(status === 'approved' || status === 'locked') && (
        <div className="bg-success/10 border border-success/30 p-4 rounded-xl flex items-center gap-4">
          <span className="material-symbols-outlined text-success">verified</span>
          <h3 className="text-success font-bold">Goals Approved & Locked</h3>
        </div>
      )}

      {/* MIDDLE SECTION: Weightage Tracker */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-white/5">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Weightage Allocation</h2>
            <p className="text-on-surface-variant text-sm mt-1">{goals?.length || 0} of 8 goals added</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${isComplete ? 'text-success' : isOver ? 'text-error' : 'text-primary'}`}>
              {totalWeightage}%
            </span>
            <span className="text-on-surface-variant text-sm ml-1">of 100% allocated</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 bg-surface-variant rounded-full overflow-hidden flex">
          <div 
            className={`h-full transition-all duration-500 ease-out ${isComplete ? 'bg-success' : isOver ? 'bg-error' : 'bg-primary'}`}
            style={{ width: `${Math.min(totalWeightage, 100)}%` }}
          />
        </div>
        {isOver && <p className="text-error text-sm mt-2 font-medium">You have exceeded the 100% allocation limit.</p>}
      </div>

      {/* MAIN SECTION: Goals List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-on-surface">Your Objectives</h2>
          {isEditable && (goals?.length || 0) < 8 && (
            <button 
              onClick={openAddModal}
              className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Goal
            </button>
          )}
        </div>

        {goals?.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest border border-dashed border-white/10 rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-outline mb-4">target</span>
            <p className="text-on-surface-variant">No goals added yet. Click "Add Goal" to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals?.map(goal => (
              <div key={goal.id} className="bg-surface-container p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row gap-6 relative group animate-fade-in">
                
                {/* Weightage Circle */}
                <div className="hidden md:flex shrink-0 w-16 h-16 rounded-full bg-primary/10 border border-primary/20 items-center justify-center flex-col">
                  <span className="text-primary font-bold text-xl leading-none">{goal.weightage}%</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-md uppercase tracking-wider">
                      {goal.thrust_area}
                    </span>
                    {goal.is_shared && (
                      <div className="relative group/tooltip">
                        <span className="px-3 py-1 bg-tertiary/20 text-tertiary text-xs font-bold rounded-md flex items-center gap-1 border border-tertiary/30 shadow-[0_0_10px_rgba(168,85,247,0.15)] cursor-help">
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          Shared
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-surface-container-lowest border border-white/10 rounded-xl shadow-2xl text-xs text-on-surface-variant z-50 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                          <strong className="text-on-surface">Shared Goal</strong>
                          <p className="mt-1">Title, description, and target are locked. Contact your manager to modify these fields.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{goal.title}</h3>
                    <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">{goal.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-outline">
                      <span className="material-symbols-outlined text-[18px]">straighten</span>
                      Type: <span className="text-on-surface-variant font-medium">{goal.uom?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-outline">
                      <span className="material-symbols-outlined text-[18px]">flag</span>
                      Target: <span className="text-on-surface-variant font-medium font-mono">
                        {goal.uom === 'timeline' 
                          ? (goal.target_date ? new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-GB') : '--') 
                          : (goal.uom === 'zero' ? 'Zero' : goal.target)}
                      </span>
                    </div>
                    {/* Mobile Weightage display */}
                    <div className="md:hidden flex items-center gap-2 text-sm text-outline">
                      <span className="material-symbols-outlined text-[18px]">scale</span>
                      Weightage: <span className="text-on-surface-variant font-medium font-mono">{goal.weightage}%</span>
                    </div>
                  </div>
                </div>

                {/* Shared goal: show lock action + weightage-only edit */}
                {isEditable && goal.is_shared && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        const newW = prompt(`Edit weightage for "${goal.title}" (remaining: ${100 - totalWeightage + Number(goal.weightage)}%):`, goal.weightage);
                        if (newW !== null && !isNaN(Number(newW)) && Number(newW) >= 1) {
                          editGoalMutation.mutate({ id: goal.id, weightage: Number(newW) });
                        }
                      }}
                      className="px-3 py-2 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 rounded-lg transition-colors text-xs font-bold border border-tertiary/20 flex items-center gap-1"
                      title="Only weightage can be modified for shared goals"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Weightage
                    </button>
                  </div>
                )}

                {/* Full edit/delete for own goals */}
                {isEditable && !goal.is_shared && (
                  <div className="flex md:flex-col gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(goal)}
                      className="p-2 text-outline hover:text-primary bg-surface-variant hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-outline hover:text-error bg-surface-variant hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM SUBMIT BUTTON */}
      <div className="mt-12 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitSheetMutation.isPending}
          className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
            canSubmit 
            ? 'bg-success hover:bg-success/90 text-on-primary shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] cursor-pointer' 
            : 'bg-surface-variant text-outline cursor-not-allowed'
          }`}
          title={!isComplete ? "Weightage must exactly equal 100%" : "Submit goals for manager approval"}
        >
          {submitSheetMutation.isPending ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined">send</span>
          )}
          {status === 'rework' ? 'Resubmit Goals' : 'Submit Goals'}
        </button>
      </div>

      {/* Add Goal Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-surface-container">
              <h2 className="text-xl font-bold text-on-surface">{editingGoalId ? 'Edit Goal' : 'Add New Goal'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="addGoalForm" onSubmit={handleSaveGoal} className="space-y-5">
                
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface block">Thrust Area</label>
                  <input 
                    required value={thrustArea} onChange={(e) => setThrustArea(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Revenue, Customer Success, Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface block">Goal Title</label>
                  <input 
                    required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="What do you want to achieve?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface block">Description (Optional)</label>
                  <textarea 
                    value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Provide details on how this will be measured..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="font-label-md text-on-surface block">Unit of Measurement (UoM)</label>
                    <select 
                      value={uomType} onChange={(e) => setUomType(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                    >
                      <option value="numeric_min">Numeric (Higher is Better)</option>
                      <option value="numeric_max">Numeric (Lower is Better)</option>
                      <option value="timeline">Timeline (Date-based)</option>
                      <option value="zero">Zero = Success</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-md text-on-surface block">Target Value</label>
                    <input 
                      required type={uomType === 'timeline' ? 'date' : 'number'}
                      value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface block">Weightage (%)</label>
                  <input 
                    required type="number" min="10" max="100"
                    value={weightage} onChange={(e) => setWeightage(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 px-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Min 10%"
                  />
                  <p className="text-xs text-outline-variant mt-1">
                    Remaining available: {remainingWeightage}%
                  </p>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-white/5 bg-surface-container flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" form="addGoalForm"
                disabled={addGoalMutation.isPending || editGoalMutation.isPending || isOverWeightage}
                className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addGoalMutation.isPending || editGoalMutation.isPending ? 'Saving...' : 'Save Goal'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
