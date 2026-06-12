import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useActiveCycle } from '../../hooks/useGoals';
import { getCurrentQuarter } from '../../utils/achievementUtils';

const NAV_CONFIG = {
  employee: [
    { label: 'My Goals', path: '/employee', icon: 'target' },
    { label: 'Achievements', path: '/employee/achievements', icon: 'bar_chart' },
    { label: 'My Progress', path: '/employee/progress', icon: 'trending_up' }
  ],
  manager: [
    { label: 'Dashboard', path: '/manager', icon: 'dashboard' },
    { label: 'Team Goals', path: '/manager/team', icon: 'groups' },
    { label: 'Check-ins', path: '/manager/checkins', icon: 'fact_check' },
    { label: 'Reports', path: '/manager/reports', icon: 'bar_chart' }
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { label: 'Cycle Management', path: '/admin/cycles', icon: 'calendar_month' },
    { label: 'User Management', path: '/admin/users', icon: 'groups' },
    { label: 'Reports', path: '/admin/reports', icon: 'description' },
    { label: 'Analytics', path: '/admin/analytics', icon: 'analytics' },
    { label: 'Audit Log', path: '/admin/audit', icon: 'security' }
  ]
};

const QuarterBadge = () => {
  const { data: cycle } = useActiveCycle();
  const quarterInfo = getCurrentQuarter(cycle);

  if (!cycle) return null;

  return (
    <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
        {quarterInfo.name} Open
      </span>
    </div>
  );
};

export const AppLayout = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const role = profile?.role || 'employee';
  const navLinks = NAV_CONFIG[role] || [];

  // Determine dynamic page title from active link
  const activeLink = navLinks.find(link => link.path === location.pathname) 
                     || navLinks.find(link => location.pathname.startsWith(link.path) && link.path !== `/${role}`)
                     || { label: 'Dashboard' };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/50 text-slate-700 font-body-md overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0 lg:static lg:w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">monitoring</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">Stratify</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="mb-4 px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Menu</span>
          </div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden group
                  ${isActive 
                    ? 'text-primary bg-primary/5 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}
                
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Area (Bottom) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 shrink-0">
              <span className="font-bold text-slate-700">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-[10px] text-primary uppercase tracking-wider font-bold truncate">
                {profile?.role || 'Role'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition-colors text-sm font-semibold border border-slate-200/50"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Top Header Bar */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-white border-b border-slate-200 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl border border-slate-200"
              onClick={() => setIsMobileOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800">
              {activeLink.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Quarter Indicator Badge */}
            <QuarterBadge />
            
            {/* Top Right Avatar */}
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center lg:hidden">
              <span className="font-bold text-slate-700 text-sm">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 relative bg-white">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          {children}
        </main>
      </div>
    </div>
  );
};
