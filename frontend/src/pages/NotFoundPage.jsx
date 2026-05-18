import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = profile?.role === 'admin'
    ? '/admin'
    : profile?.role === 'manager'
    ? '/manager'
    : profile?.role === 'employee'
    ? '/employee'
    : '/login';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="text-center max-w-lg relative z-10 animate-fade-in">
        
        {/* Glowing 404 */}
        <div className="relative mb-8">
          <span className="text-[160px] font-black text-on-surface/5 leading-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            404
          </span>
          <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(56,189,248,0.2)] relative">
            <span className="material-symbols-outlined text-primary text-5xl">search_off</span>
          </div>
        </div>

        <h1 className="text-4xl font-black text-on-surface mb-3">Page Not Found</h1>
        <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-bold border border-white/10 text-on-surface hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Go Back
          </button>
          <Link
            to={dashboardPath}
            className="px-6 py-3 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(56,189,248,0.25)] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};
