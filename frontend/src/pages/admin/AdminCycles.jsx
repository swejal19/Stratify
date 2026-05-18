import React, { useState } from 'react';
import { useAllCycles, useUpsertCycleMutation, useToggleCycleStatusMutation } from '../../hooks/useAdmin';

export const AdminCycles = () => {
  const { data: cycles, isLoading } = useAllCycles();
  const upsertCycleMutation = useUpsertCycleMutation();
  const toggleCycleMutation = useToggleCycleStatusMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    goal_setting_open: '',
    q1_open: '',
    q2_open: '',
    q3_open: '',
    q4_open: ''
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  const handleToggleActive = async (cycleId, currentStatus) => {
    try {
      await toggleCycleMutation.mutateAsync({ cycleId, makeActive: !currentStatus });
      setToastMessage(!currentStatus ? 'Cycle activated' : 'Cycle deactivated');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      alert('Failed to toggle cycle status');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await upsertCycleMutation.mutateAsync({
        ...formData,
        is_active: false // newly created cycles are inactive by default
      });
      setIsModalOpen(false);
      setFormData({
        name: '', year: new Date().getFullYear(),
        goal_setting_open: '', q1_open: '', q2_open: '', q3_open: '', q4_open: ''
      });
    } catch (err) {
      alert('Failed to create cycle. ' + (err.message || ''));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in relative">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-success text-white px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined bg-white/20 text-white p-1 rounded-full">check_circle</span>
          <span className="font-bold text-white">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-auto text-white/70 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-on-surface">Cycle Management</h1>
          <p className="text-on-surface-variant font-body-md mt-1">Configure annual performance cycles and active quarters.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Cycle
        </button>
      </div>

      <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-white/5 text-xs text-outline font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Goal Setting</th>
                <th className="px-6 py-4">Q1 Open</th>
                <th className="px-6 py-4">Q2 Open</th>
                <th className="px-6 py-4">Q3 Open</th>
                <th className="px-6 py-4">Q4 Open</th>
                <th className="px-6 py-4 text-center">Active Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {cycles?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-on-surface-variant">No cycles found. Create one to begin.</td>
                </tr>
              ) : (
                cycles?.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface whitespace-nowrap">{cycle.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono">{cycle.year}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono">{cycle.goal_setting_open ? new Date(cycle.goal_setting_open).toLocaleDateString() : '--'}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono">{cycle.q1_open ? new Date(cycle.q1_open).toLocaleDateString() : '--'}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono">{cycle.q2_open ? new Date(cycle.q2_open).toLocaleDateString() : '--'}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono">{cycle.q3_open ? new Date(cycle.q3_open).toLocaleDateString() : '--'}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono">{cycle.q4_open ? new Date(cycle.q4_open).toLocaleDateString() : '--'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(cycle.id, cycle.is_active)}
                        disabled={toggleCycleMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 border ${
                          cycle.is_active ? 'bg-success border-success' : 'bg-surface-variant border-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                            cycle.is_active ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white/50'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW CYCLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-white/5 bg-surface-container flex justify-between items-center">
              <h2 className="text-xl font-bold text-on-surface">Create New Cycle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              <form id="cycleForm" onSubmit={handleCreateSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Name <span className="text-error">*</span></label>
                    <input 
                      required type="text" placeholder="e.g., FY25"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Year <span className="text-error">*</span></label>
                    <input 
                      required type="number" 
                      value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <label className="text-xs font-bold text-outline uppercase">Goal Setting Open Date</label>
                  <input 
                    type="date" required
                    value={formData.goal_setting_open} onChange={e => setFormData({...formData, goal_setting_open: e.target.value})}
                    className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Q1 Open</label>
                    <input 
                      type="date" required
                      value={formData.q1_open} onChange={e => setFormData({...formData, q1_open: e.target.value})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Q2 Open</label>
                    <input 
                      type="date" required
                      value={formData.q2_open} onChange={e => setFormData({...formData, q2_open: e.target.value})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Q3 Open</label>
                    <input 
                      type="date" required
                      value={formData.q3_open} onChange={e => setFormData({...formData, q3_open: e.target.value})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Q4 Open</label>
                    <input 
                      type="date" required
                      value={formData.q4_open} onChange={e => setFormData({...formData, q4_open: e.target.value})}
                      className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-3 py-2 text-on-surface"
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-white/5 bg-surface-container flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" form="cycleForm"
                disabled={upsertCycleMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {upsertCycleMutation.isPending ? 'Saving...' : 'Save Cycle'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
