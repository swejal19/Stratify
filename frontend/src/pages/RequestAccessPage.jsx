import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RequestAccessPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'employee',
    department: '',
    manager_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to request access');
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-body-md overflow-hidden">
      {/* Left Side - Enhanced Light Branding Column (Copied from Login) */}
      <div className="hidden md:flex md:w-1/2 relative bg-slate-100 flex-col justify-center items-center p-12 overflow-hidden border-r border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-slate-50 to-secondary/5"></div>
        <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[340px] h-[340px] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: `linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-1/4 right-1/4 material-symbols-outlined text-primary/20 text-[72px] animate-float" style={{ animationDelay: '0s' }}>target</div>
        <div className="absolute bottom-[30%] left-[18%] material-symbols-outlined text-secondary/20 text-[56px] animate-float" style={{ animationDelay: '1.5s' }}>insights</div>
        <div className="absolute top-1/3 left-[15%] material-symbols-outlined text-emerald-500/20 text-[64px] animate-float" style={{ animationDelay: '3s' }}>rocket_launch</div>

        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center p-5 bg-white rounded-3xl border border-slate-200 shadow-sm mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[32px]">monitoring</span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-none">Stratify</h1>
          <p className="text-slate-500 text-base leading-relaxed mt-6">
            Join the Next Generation of Performance Management. Request access to align your goals and track progress.
          </p>
        </div>
      </div>

      {/* Right Side - Request Access Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Login
          </button>

          <div className="md:hidden text-center mb-4">
            <span className="material-symbols-outlined text-primary text-[48px] mb-2">monitoring</span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stratify</h1>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Request Access</h2>
            <p className="text-slate-500 text-sm">Fill out the form below to request a Stratify account.</p>
          </div>

          {success ? (
            <div className="space-y-6 animate-fade-in mt-4">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center space-y-4">
                <span className="material-symbols-outlined text-emerald-500 text-5xl">check_circle</span>
                <p className="text-emerald-700 font-medium text-sm">
                  ✅ Request submitted! An admin will review your request and contact you soon.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 text-sm"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">Full Name *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">Work Email *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Role *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">badge</span>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Department</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">domain</span>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-sm"
                      placeholder="e.g. Sales"
                    />
                  </div>
                </div>
              </div>

              {formData.role === 'employee' && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Your Manager's Email (optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">supervisor_account</span>
                    <input
                      type="email"
                      value={formData.manager_email}
                      onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-sm"
                      placeholder="manager@company.com"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 mt-4 animate-fade-in">
                  <span className="material-symbols-outlined text-rose-500 text-[18px]">error</span>
                  <p className="text-rose-600 text-xs font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_2px_10px_rgba(0,99,151,0.1)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm mt-6"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                    Request Access
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
