import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
import { useActiveCycle } from '../../hooks/useGoals';
import { getCurrentQuarter } from '../../utils/achievementUtils';

const QuarterBadge = () => {
  const { data: cycle } = useActiveCycle();
  const quarterInfo = getCurrentQuarter(cycle);

  if (!cycle) return null;

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-tertiary/10 border border-tertiary/20 rounded-full">
      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
      <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">
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
    <div className="flex h-screen bg-background text-on-background font-body-md overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-lowest border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0 lg:static lg:w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="material-symbols-outlined text-primary text-[18px]">monitoring</span>
            </div>
            <span className="font-headline-md text-[20px] font-bold tracking-tight text-on-surface">Stratify</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="mb-4 px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Menu</span>
          </div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden group
                  ${isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                  }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)] rounded-r-full" />
                )}
                
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-outline group-hover:text-primary transition-colors'}`}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Area (Bottom) */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-white/10 shrink-0">
              <span className="font-bold text-on-surface">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-primary uppercase tracking-wider font-semibold truncate">
                {profile?.role || 'Role'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface-variant hover:bg-error/20 hover:text-error text-on-surface-variant rounded-lg transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        
        {/* Top Header Bar */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-surface-container-lowest border-b border-white/5 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface bg-surface-variant rounded-lg"
              onClick={() => setIsMobileOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-on-surface">
              {activeLink.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Quarter Indicator Badge */}
            <QuarterBadge />
            
            {/* Top Right Avatar */}
            <div className="w-9 h-9 rounded-full bg-surface-variant border border-white/10 flex items-center justify-center lg:hidden">
              <span className="font-bold text-on-surface text-sm">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          {children}
        </main>
      </div>
    </div>
  );
};
