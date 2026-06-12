import React, { useState } from 'react';
import { useAllProfiles, useUpdateProfileMutation, useAdminUnlockGoalsMutation } from '../../hooks/useAdmin';
import { PushGoalModal } from '../../components/shared/PushGoalModal';
import { supabase } from '../../lib/supabase';

export const AdminUsers = () => {
  const { data: profiles, isLoading } = useAllProfiles();
  const updateProfileMutation = useUpdateProfileMutation();
  const unlockGoalsMutation = useAdminUnlockGoalsMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Drawer form state
  const [formData, setFormData] = useState({
    role: '',
    department: '',
    manager_id: ''
  });

  const [isPushModalOpen, setIsPushModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [newUserData, setNewUserData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    manager_id: ''
  });

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter profiles
  const filteredProfiles = profiles?.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const managersList = profiles?.filter(p => p.role === 'manager' || p.role === 'admin') || [];

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      role: user.role || 'employee',
      department: user.department || '',
      manager_id: user.manager_id || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        id: selectedUser.id,
        updates: formData
      });
      showToast('Profile updated successfully');
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleUnlockGoals = async (userId, name) => {
    if (confirm(`Are you sure you want to forcibly unlock ${name}'s goals? This will set their sheet back to draft.`)) {
      try {
        await unlockGoalsMutation.mutateAsync(userId);
        showToast(`Unlocked goals for ${name}`);
      } catch (err) {
        alert(err.message || 'Failed to unlock goals');
      }
    }
  };

  const handleCreateUser = async () => {

    // REQUIRED FIELD VALIDATION
    if (
      !newUserData.full_name.trim() ||
      !newUserData.email.trim() ||
      !newUserData.password.trim() ||
      !newUserData.role.trim() ||
      !newUserData.department.trim() ||
      (
        newUserData.role === 'employee' &&
        !newUserData.manager_id
      )
    ) {
      alert('All fields are required');
      return;
    }

    const normalizedEmail = newUserData.email.trim().toLowerCase();
    const normalizedFullName = newUserData.full_name.trim();

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // PASSWORD VALIDATION
    if (newUserData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      setIsCreatingUser(true);

      // Step 1 — Create auth account
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: newUserData.password,
        options: {
          data: {
            full_name: normalizedFullName
          }
        }
      });

      if (error) throw error;

      // Step 2 — Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: normalizedFullName,
          email: normalizedEmail,
          role: newUserData.role,
          department: newUserData.department,
          manager_id: newUserData.manager_id || null
        });

      if (profileError) throw profileError;

      showToast('User created! They can now login with their credentials.');

      setIsAddUserOpen(false);

      setNewUserData({
        full_name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        manager_id: ''
      });

      window.location.reload();

    } catch (err) {
      const message = err?.status === 429 || err?.message?.toLowerCase().includes('rate limit')
        ? 'Too many signup attempts. Please wait a few minutes before trying again.'
        : err?.message || 'Failed to create user';
      alert(message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in relative">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[200] bg-success/20 border border-success/30 text-success px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-slate-700">User Management</h1>
          <p className="text-slate-700-variant font-body-md mt-1">Manage employee roles, departments, and overrides.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" placeholder="Search users..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline rounded-lg text-slate-700 focus:border-primary"
            />
          </div>
          <select 
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-surface-container border border-outline rounded-lg text-slate-700 focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button 
            onClick={() => setIsPushModalOpen(true)}
            className="bg-tertiary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-tertiary/90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
            Push Goal
          </button>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">
              person_add
            </span>
            Add User
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container rounded-2xl border border-outline overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Name & Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProfiles?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-700-variant">No users found matching your criteria.</td>
                </tr>
              ) : (
                filteredProfiles?.map((user) => {
                  const managerName = profiles?.find(p => p.id === user.manager_id)?.full_name || '--';
                  return (
                    <tr key={user.id} className="hover:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{user.full_name}</div>
                        <div className="text-xs text-slate-700-variant">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${user.role === 'admin' ? 'bg-error/10 text-error' : 
                            user.role === 'manager' ? 'bg-tertiary/10 text-tertiary' : 
                            'bg-primary/10 text-primary'}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700-variant">{user.department || '--'}</td>
                      <td className="px-6 py-4 text-slate-700-variant">{managerName}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleUnlockGoals(user.id, user.full_name)}
                          disabled={unlockGoalsMutation.isPending}
                          className="px-3 py-1.5 rounded bg-warning/10 text-warning hover:bg-warning/20 font-bold text-xs transition-colors"
                          title="Force unlock Goal Sheet back to Draft"
                        >
                          Unlock Goals
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="px-3 py-1.5 rounded bg-surface-variant text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors"
                        >
                          Edit
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

      {/* EDIT DRAWER */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]" onClick={() => setSelectedUser(null)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-container-lowest border-l border-outline z-[110] shadow-2xl flex flex-col transform animate-slide-in-right">
            
            <div className="px-8 py-6 border-b border-outline bg-surface-container flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-700">Edit User</h2>
                <p className="text-sm text-slate-700-variant">{selectedUser.full_name}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700 p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-4 py-3 text-slate-700"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                <input 
                  type="text"
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-4 py-3 text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manager</label>
                <select 
                  value={formData.manager_id} onChange={e => setFormData({...formData, manager_id: e.target.value})}
                  className="w-full bg-surface-variant border border-transparent focus:border-primary rounded-lg px-4 py-3 text-slate-700"
                >
                  <option value="">None (Top Level)</option>
                  {managersList.map(m => (
                    <option key={m.id} value={m.id} disabled={m.id === selectedUser.id}>
                      {m.full_name} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="p-6 border-t border-outline bg-surface-container flex justify-end gap-3">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-lg font-bold text-slate-700-variant hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={updateProfileMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </>
      )}

      {/* PUSH GOAL MODAL */}
      <PushGoalModal 
        isOpen={isPushModalOpen} 
        onClose={() => setIsPushModalOpen(false)} 
        employees={profiles || []} 
      />

      {isAddUserOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={() => setIsAddUserOpen(false)}
          ></div>

          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-surface-container border border-outline rounded-3xl shadow-2xl overflow-hidden animate-fade-in">

              {/* Header */}
              <div className="px-8 py-6 border-b border-outline bg-surface-container-lowest flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-700">
                    Add New User
                  </h2>

                  <p className="text-sm text-slate-700-variant mt-1">
                    Create employee, manager, or admin accounts
                  </p>
                </div>

                <button
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined">
                    close
                  </span>
                </button>
              </div>

              {/* Form */}
              <div className="p-8 space-y-5">

                <div>
                  <label className="text-xs uppercase text-slate-400 font-bold">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={newUserData.full_name}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        full_name: e.target.value
                      })
                    }
                    className="w-full mt-2 bg-surface-variant border border-outline rounded-xl px-4 py-3 text-slate-700 focus:border-primary outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-slate-400 font-bold">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        email: e.target.value
                      })
                    }
                    className="w-full mt-2 bg-surface-variant border border-outline rounded-xl px-4 py-3 text-slate-700 focus:border-primary outline-none"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-slate-400 font-bold">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    value={newUserData.password}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        password: e.target.value
                      })
                    }
                    className="w-full mt-2 bg-surface-variant border border-outline rounded-xl px-4 py-3 text-slate-700 focus:border-primary outline-none"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="text-xs uppercase text-slate-400 font-bold">
                      Role
                    </label>

                    <select
                      value={newUserData.role}
                      required
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          role: e.target.value
                        })
                      }
                      className="w-full mt-2 bg-surface-variant border border-outline rounded-xl px-4 py-3 text-slate-700"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs uppercase text-slate-400 font-bold">
                      Department
                    </label>

                    <input
                      type="text"
                      required
                      value={newUserData.department}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          department: e.target.value
                        })
                      }
                      className="w-full mt-2 bg-surface-variant border border-outline rounded-xl px-4 py-3 text-slate-700"
                      placeholder="Engineering"
                    />
                  </div>

                </div>

                <div>
                  <label className="text-xs uppercase text-slate-400 font-bold">
                    Reporting Manager
                  </label>

                  <select
                    value={newUserData.manager_id}
                    required
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        manager_id: e.target.value
                      })
                    }
                    className="w-full mt-2 bg-surface-variant border border-outline rounded-xl px-4 py-3 text-slate-700"
                  >
                    <option value="">None</option>

                    {managersList.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.full_name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-outline bg-surface-container-lowest flex justify-end gap-3">

                <button
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-slate-700-variant hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateUser}
                  disabled={isCreatingUser}
                  className={`px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all ${isCreatingUser ? 'bg-surface-variant text-slate-700-variant cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white'}`}
                >
                  {isCreatingUser ? 'Creating…' : 'Create User'}
                </button>

              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
