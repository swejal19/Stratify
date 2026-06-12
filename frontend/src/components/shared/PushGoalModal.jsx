import React, { useState } from 'react';
import { usePushSharedGoalMutation } from '../../hooks/useGoals';
import { useActiveCycle } from '../../hooks/useGoals';

export const PushGoalModal = ({ isOpen, onClose, employees }) => {
  const { data: cycle } = useActiveCycle();
  const pushGoalMutation = usePushSharedGoalMutation();

  const [step, setStep] = useState(1); // 1: Define, 2: Select, 3: Confirm
  
  const [formData, setFormData] = useState({
    thrust_area: '',
    title: '',
    description: '',
    uom: 'numeric_max',
    target: '',
    target_date: '',
    weightage: 10
  });

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(search.toLowerCase()) || 
    emp.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    try {
      const goalPayload = {
        ...formData,
        description: formData.description || null,
        target: formData.uom === 'zero'
          ? 0
          : formData.uom === 'timeline'
            ? null
            : formData.target !== ''
              ? Number(formData.target)
              : null,
        target_date: formData.uom === 'timeline'
          ? formData.target_date || null
          : null,
        weightage: Number(formData.weightage),
        shared_from: null
      };

      await pushGoalMutation.mutateAsync({
        cycleId: cycle.id,
        employeeIds: selectedEmployees,
        goalPayload
      });
      alert(`Successfully pushed goal to ${selectedEmployees.length} employees!`);
      onClose();
    } catch (err) {
      alert('Failed to push shared goal: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline bg-surface-container flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Push Shared Goal</h2>
            <div className="flex gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-surface-variant'}`}></span>
              <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-variant'}`}></span>
              <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-surface-variant'}`}></span>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <h3 className="text-lg font-bold text-on-surface">Step 1: Define Goal</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase">Thrust Area</label>
                  <input 
                    type="text" required value={formData.thrust_area} onChange={e => setFormData({...formData, thrust_area: e.target.value})}
                    className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                    placeholder="e.g. Innovation"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase">Goal Title</label>
                  <input 
                    type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                    placeholder="e.g. Launch AI Feature"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase">Description</label>
                <textarea 
                  required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface h-20 resize-none custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase">Unit of Measurement (UoM)</label>
                  <select 
                    value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value, target: '', target_date: ''})}
                    className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                  >
                    <option value="numeric_max">Maximize Number (e.g. Revenue)</option>
                    <option value="numeric_min">Minimize Number (e.g. Errors)</option>
                    <option value="timeline">Timeline (Date)</option>
                    <option value="zero">Zero Tolerance (Yes/No)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase">Target</label>
                  {formData.uom === 'zero' ? (
                    <div className="w-full rounded-lg border border-outline bg-surface-variant px-3 py-3 text-on-surface-variant">
                      Target is automatically set to Zero
                    </div>
                  ) : formData.uom === 'timeline' ? (
                    <input
                      type="date"
                      required
                      value={formData.target_date}
                      onChange={e => setFormData({...formData, target_date: e.target.value})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface font-mono"
                    />
                  ) : (
                    <input 
                      type="number" min="0" required
                      value={formData.target}
                      onChange={e => setFormData({...formData, target: e.target.value})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface font-mono"
                      placeholder="Target"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-outline uppercase">Default Weightage (%)</label>
                <input 
                  type="number" min="10" max="100" required
                  value={formData.weightage} onChange={e => setFormData({...formData, weightage: Number(e.target.value)})}
                  className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface font-mono"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-up h-full flex flex-col">
              <h3 className="text-lg font-bold text-on-surface shrink-0">Step 2: Select Recipients</h3>
              
              <div className="relative shrink-0">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  type="text" placeholder="Search employees by name or dept..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline rounded-lg text-on-surface focus:border-primary"
                />
              </div>

              <div className="flex justify-between items-center px-2 py-1 shrink-0 border-b border-outline pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-outline bg-surface-variant text-primary focus:ring-primary"
                  />
                  Select All
                </label>
                <span className="text-xs font-bold text-primary">{selectedEmployees.length} selected</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2 min-h-[250px]">
                {filteredEmployees.map(emp => (
                  <label key={emp.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedEmployees.includes(emp.id) ? 'bg-primary/10 border border-primary/20' : 'hover:hover:bg-slate-50 border border-transparent'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => handleToggleEmployee(emp.id)}
                      className="w-4 h-4 rounded border-outline bg-surface-variant text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-bold text-on-surface text-sm">{emp.full_name}</div>
                      <div className="text-xs text-on-surface-variant">{emp.department || 'No Dept'}</div>
                    </div>
                  </label>
                ))}
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-8 text-outline">No employees found.</div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <h3 className="text-lg font-bold text-on-surface">Step 3: Confirm & Push</h3>
              
              <div className="bg-surface-container border border-outline p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary/20 text-tertiary border border-tertiary/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    Shared Goal
                  </span>
                  <span className="text-xs font-bold text-outline">{formData.thrust_area}</span>
                </div>
                <h4 className="text-xl font-bold text-on-surface">{formData.title}</h4>
                <p className="text-sm text-on-surface-variant">{formData.description}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline">
                  <div>
                    <div className="text-xs text-outline uppercase font-bold mb-1">Target</div>
                    <div className="font-mono text-on-surface font-bold bg-slate-50 px-2 py-1 rounded inline-block">
                      {formData.uom === 'zero'
                        ? 'Zero'
                        : formData.uom === 'timeline'
                          ? (formData.target_date || 'N/A')
                          : (formData.target || 'N/A')}
                      <span className="text-xs text-outline ml-1">({formData.uom})</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-outline uppercase font-bold mb-1">Weightage</div>
                    <div className="font-mono text-primary font-bold bg-primary/10 px-2 py-1 rounded inline-block">{formData.weightage}%</div>
                  </div>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-warning shrink-0">info</span>
                <div>
                  <h4 className="text-sm font-bold text-warning mb-1">Impact Summary</h4>
                  <p className="text-xs text-warning/80">
                    This goal will be pushed to <strong>{selectedEmployees.length} employees</strong>. It will be locked on their end (they cannot edit the title, description, or target). It will consume {formData.weightage}% of their total goal sheet weightage.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline bg-surface-container flex justify-between shrink-0">
          <button 
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className={`px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-variant transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            Back
          </button>
          
          {step < 3 ? (
            <button 
              onClick={() => {
                if (step === 1) {
                  if (!formData.title || !formData.description) {
                    alert('Please fill all required fields.');
                    return;
                  }

                  if (Number(formData.weightage) < 10) {
                    alert('Weightage must be at least 10%.');
                    return;
                  }

                  if (formData.uom === 'timeline' && !formData.target_date) {
                    alert('Please choose a target date for timeline goals.');
                    return;
                  }

                  if ((formData.uom === 'numeric_min' || formData.uom === 'numeric_max') && formData.target === '') {
                    alert('Please enter a target value for the selected numeric unit.');
                    return;
                  }
                }
                setStep(prev => Math.min(3, prev + 1))
              }}
              className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={pushGoalMutation.isPending || selectedEmployees.length === 0}
              className="bg-tertiary hover:bg-tertiary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              {pushGoalMutation.isPending ? 'Pushing...' : `Push to ${selectedEmployees.length} Employees`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
