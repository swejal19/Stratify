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
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  {
    role: 'Manager',
    email: 'manager@demo.com',
    password: 'Manager@123',
    icon: 'manage_accounts',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
  },
  {
    role: 'Admin',
    email: 'admin@demo.com',
    password: 'Admin@123',
    icon: 'admin_panel_settings',
    borderClass: 'border-orange-500',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
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
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-body-md overflow-hidden">
    
      {/* Left Side - Enhanced Animated Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#0A0F1E] flex-col justify-center items-center p-12 overflow-hidden border-r border-white/5">

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[#0A0F1E] to-secondary/10"></div>

        {/* Animated Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-primary/20 rounded-full blur-[140px] mix-blend-screen animate-pulse"></div>

        <div
          className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-secondary/20 rounded-full blur-[140px] mix-blend-screen animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
        linear-gradient(to right, white 1px, transparent 1px),
        linear-gradient(to bottom, white 1px, transparent 1px)
      `,
            backgroundSize: '40px 40px'
          }}
        ></div>

        {/* Floating Icons */}
        <div
          className="absolute top-1/4 right-1/4 material-symbols-outlined text-primary/30 text-[72px] animate-float"
          style={{ animationDelay: '0s' }}
        >
          target
        </div>

        <div
          className="absolute bottom-[30%] left-[18%] material-symbols-outlined text-secondary/30 text-[56px] animate-float"
          style={{ animationDelay: '1.5s' }}
        >
          insights
        </div>

        <div
          className="absolute top-1/3 left-[15%] material-symbols-outlined text-tertiary/30 text-[64px] animate-float"
          style={{ animationDelay: '3s' }}
        >
          rocket_launch
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-md">

          {/* Logo Card */}
          <div className="inline-flex items-center justify-center p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl mb-8">

            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[42px]">
                monitoring
              </span>
            </div>

          </div>

          {/* Heading */}
          <h1 className="text-[64px] font-bold text-white tracking-tight leading-none">
            Stratify
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-lg leading-relaxed mt-6">
            Transform organizational goals into measurable success with intelligent tracking, approvals, and quarterly performance insights.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center gap-4 mt-10">

            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-white text-xl font-bold">100%</p>
              <span className="text-white/50 text-xs">
                Validation
              </span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-white text-xl font-bold">Q1-Q4</p>
              <span className="text-white/50 text-xs">
                Tracking
              </span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-white text-xl font-bold">3 Roles</p>
              <span className="text-white/50 text-xs">
                Access
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-background overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">

          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Home
          </button>

          {/* Mobile Header */}
          <div className="md:hidden text-center mb-4">
            <span className="material-symbols-outlined text-primary text-[48px] mb-2">monitoring</span>
            <h1 className="font-headline-lg text-on-surface font-bold">Stratify</h1>
          </div>

          {/* Welcome Text */}
          <div className="space-y-1">
            <h2 className="font-headline-lg text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant font-body-md">Select a demo role or enter credentials manually.</p>
          </div>

          {/* ⚡ Quick Demo Access */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-[18px]">bolt</span>
              <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Quick Demo Access</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_ROLES.map((demoRole) => (
                <button
                  key={demoRole.role}
                  type="button"
                  onClick={() => handleRoleSelect(demoRole)}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-center
                    ${selectedRole === demoRole.role
                      ? `${demoRole.borderClass} ${demoRole.bgClass}`
                      : 'border-white/10 bg-surface-container hover:border-white/20'
                    }`}
                >
                  {selectedRole === demoRole.role && (
                    <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center ${demoRole.bgClass} border ${demoRole.borderClass}`}>
                      <span className={`material-symbols-outlined text-[14px] ${demoRole.textClass}`}>check</span>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-lg ${demoRole.iconBg} flex items-center justify-center mx-auto mb-2`}>
                    <span className={`material-symbols-outlined ${demoRole.textClass} text-[22px]`}>{demoRole.icon}</span>
                  </div>
                  <p className={`font-bold text-sm ${selectedRole === demoRole.role ? demoRole.textClass : 'text-on-surface'}`}>
                    {demoRole.role}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    {selectedRole === demoRole.role ? '✓ Auto-filled' : 'Click to fill'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-outline uppercase tracking-wider">or enter manually</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-md text-on-surface block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSelectedRole(null); }}
                  required
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-on-surface block">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSelectedRole(null); }}
                  required
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
              <div className="p-3 bg-error-container/20 border border-error/50 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <p className="text-center text-xs text-outline">
              Account issues? Contact your system administrator.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
};