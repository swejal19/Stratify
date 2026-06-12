import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const DEMO_ROLES = [
  {
    role: 'Employee',
    email: 'employee@demo.com',
    password: 'Employee@123',
    icon: 'person',
    borderClass: 'border-[#006397]',
    bgClass: 'bg-[#006397]/5',
    textClass: 'text-[#006397]',
    iconBg: 'bg-[#006397]/10',
  },
  {
    role: 'Manager',
    email: 'manager@demo.com',
    password: 'Manager@123',
    icon: 'manage_accounts',
    borderClass: 'border-[#005582]',
    bgClass: 'bg-[#005582]/5',
    textClass: 'text-[#005582]',
    iconBg: 'bg-[#005582]/10',
  },
  {
    role: 'Admin',
    email: 'admin@demo.com',
    password: 'Admin@123',
    icon: 'admin_panel_settings',
    borderClass: 'border-[#10B981]',
    bgClass: 'bg-[#10B981]/5',
    textClass: 'text-[#10B981]',
    iconBg: 'bg-[#10B981]/10',
  },
];

export const LoginPage = () => {
  const { signIn, signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (demoRole) => {
    setSelectedRole(demoRole.role);
    setEmail(demoRole.email);
    setPassword(demoRole.password);
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError, data } = await signIn({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // Wait briefly for auth/session to settle
      setTimeout(async () => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profileData?.role;

        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'manager') {
          navigate('/manager');
        } else {
          navigate('/employee');
        }

        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-body-md overflow-hidden">
    
      {/* Left Side - Enhanced Light Branding Column */}
      <div className="hidden md:flex md:w-1/2 relative bg-slate-100 flex-col justify-center items-center p-12 overflow-hidden border-r border-slate-200">

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-slate-50 to-secondary/5"></div>

        {/* Animated Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-[340px] h-[340px] bg-secondary/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #E2E8F0 1px, transparent 1px),
              linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        ></div>

        {/* Floating Icons */}
        <div
          className="absolute top-1/4 right-1/4 material-symbols-outlined text-primary/20 text-[72px] animate-float"
          style={{ animationDelay: '0s' }}
        >
          target
        </div>

        <div
          className="absolute bottom-[30%] left-[18%] material-symbols-outlined text-secondary/20 text-[56px] animate-float"
          style={{ animationDelay: '1.5s' }}
        >
          insights
        </div>

        <div
          className="absolute top-1/3 left-[15%] material-symbols-outlined text-emerald-500/20 text-[64px] animate-float"
          style={{ animationDelay: '3s' }}
        >
          rocket_launch
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-md">

          {/* Logo Card */}
          <div className="inline-flex items-center justify-center p-5 bg-white rounded-3xl border border-slate-200 shadow-sm mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[32px]">
                monitoring
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
            Stratify
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 text-base leading-relaxed mt-6">
            Transform organizational goals into measurable success with intelligent tracking, approvals, and quarterly performance insights.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center gap-4 mt-10">

            <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-slate-800 text-lg font-bold">100%</p>
              <span className="text-slate-400 text-xs">
                Validation
              </span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-slate-800 text-lg font-bold">Q1-Q4</p>
              <span className="text-slate-400 text-xs">
                Tracking
              </span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-slate-800 text-lg font-bold">3 Roles</p>
              <span className="text-slate-400 text-xs">
                Access
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">

          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Home
          </button>

          {/* Mobile Header */}
          <div className="md:hidden text-center mb-4">
            <span className="material-symbols-outlined text-primary text-[48px] mb-2">monitoring</span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stratify</h1>
          </div>

          {/* Welcome Text */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm">Select a demo role or enter credentials manually.</p>
          </div>

          {/* ⚡ Quick Demo Access */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">bolt</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Demo Access</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_ROLES.map((demoRole) => (
                <button
                  key={demoRole.role}
                  type="button"
                  onClick={() => handleRoleSelect(demoRole)}
                  className={`relative p-3 rounded-2xl border transition-all duration-200 text-center
                    ${selectedRole === demoRole.role
                      ? `${demoRole.borderClass} ${demoRole.bgClass} border-2`
                      : 'border-slate-200 bg-slate-100/50 hover:border-slate-300'
                    }`}
                >
                  {selectedRole === demoRole.role && (
                    <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center ${demoRole.bgClass} border ${demoRole.borderClass}`}>
                      <span className={`material-symbols-outlined text-[12px] ${demoRole.textClass} font-bold`}>check</span>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl ${demoRole.iconBg} flex items-center justify-center mx-auto mb-2`}>
                    <span className={`material-symbols-outlined ${demoRole.textClass} text-[22px]`}>{demoRole.icon}</span>
                  </div>
                  <p className={`font-bold text-sm ${selectedRole === demoRole.role ? demoRole.textClass : 'text-slate-700'}`}>
                    {demoRole.role}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedRole === demoRole.role ? '✓ Auto-filled' : 'Click to fill'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or enter manually</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSelectedRole(null); }}
                  required
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase block">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSelectedRole(null); }}
                  required
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_2px_10px_rgba(0,99,151,0.1)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  {selectedRole ? `Sign In as ${selectedRole}` : 'Sign In'}
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-rose-500 text-[18px]">error</span>
                <p className="text-rose-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <p className="text-center text-xs text-slate-400 mt-4">
              Account issues? Contact your system administrator.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
};
