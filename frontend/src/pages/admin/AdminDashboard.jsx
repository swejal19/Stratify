import React from 'react';
import { useActiveCycle } from '../../hooks/useGoals';
import { useAdminDashboardData } from '../../hooks/useAdmin';
import { getCurrentQuarter } from '../../utils/achievementUtils';

export const AdminDashboard = () => {
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: dashboardData, isLoading: dataLoading } = useAdminDashboardData(cycle?.id);

  const isLoading = cycleLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  const { employees, sheets, recentLogs, checkinRate } = dashboardData || {};

  // Calculate stats
  const totalEmployees = employees?.length || 0;

  // Submission Rate (submitted, locked, approved, rework)
  const submittedSheets = sheets?.filter(s => s.status !== 'draft') || [];
  const submissionRate = totalEmployees > 0 ? (submittedSheets.length / totalEmployees) * 100 : 0;

  // Approval Rate (locked / total submitted)
  const lockedSheets = sheets?.filter(s => s.status === 'locked' || s.status === 'approved') || [];
  const approvalRate = submittedSheets.length > 0 ? (lockedSheets.length / submittedSheets.length) * 100 : 0;

  // Department aggregation
  const deptStats = {};
  employees?.forEach(emp => {
    const dept = emp.department || 'Unassigned';
    if (!deptStats[dept]) deptStats[dept] = { total: 0, submitted: 0, locked: 0 };
    deptStats[dept].total += 1;

    const sheet = sheets?.find(s => s.employee_id === emp.id);
    if (sheet && sheet.status !== 'draft') deptStats[dept].submitted += 1;
    if (sheet && (sheet.status === 'locked' || sheet.status === 'approved')) deptStats[dept].locked += 1;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in relative">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-on-surface">Admin Dashboard</h1>
          <p className="text-on-surface-variant font-body-md mt-1">Platform overview and activity monitoring.</p>
        </div>
        {cycle ? (
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Active Cycle: {cycle.name}
          </div>
        ) : (
          <div className="px-4 py-2 bg-error/10 border border-error/20 rounded-lg text-error font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            No Active Cycle
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-surface-container p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-success font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> Live
            </span>
          </div>
          <h3 className="text-4xl font-mono font-bold text-on-surface mb-1">{totalEmployees}</h3>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Total Employees</p>
        </div>

        <div className="bg-surface-container p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">send</span>
            </div>
          </div>
          <h3 className="text-4xl font-mono font-bold text-on-surface mb-1">{Math.round(submissionRate)}%</h3>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Goal Submission</p>
          <div className="h-1.5 w-full bg-surface-variant rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-tertiary" style={{ width: `${submissionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-success/20 text-success flex items-center justify-center">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
          <h3 className="text-4xl font-mono font-bold text-on-surface mb-1">{Math.round(approvalRate)}%</h3>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Manager Approval</p>
          <div className="h-1.5 w-full bg-surface-variant rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-success" style={{ width: `${approvalRate}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-warning/20 text-warning flex items-center justify-center">
              <span className="material-symbols-outlined">fact_check</span>
            </div>
          </div>
          <h3 className="text-4xl font-mono font-bold text-on-surface mb-1">{Math.round(checkinRate)}%</h3>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Q{getCurrentQuarter(cycle).quarter} Check-ins</p><div className="h-1.5 w-full bg-surface-variant rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-warning" style={{ width: `${checkinRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Dept Table */}
        <div className="bg-surface-container rounded-2xl border border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface">Department Status</h2>
            <span className="material-symbols-outlined text-outline">corporate_fare</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-white/5 text-xs text-outline font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-center">Employees</th>
                  <th className="px-6 py-4 text-center">Submitted</th>
                  <th className="px-6 py-4 text-center">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.keys(deptStats).map(dept => (
                  <tr key={dept} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-on-surface">{dept}</td>
                    <td className="px-6 py-4 text-center font-mono">{deptStats[dept].total}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-tertiary">{deptStats[dept].submitted}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-success">{deptStats[dept].locked}</span>
                    </td>
                  </tr>
                ))}
                {Object.keys(deptStats).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="bg-surface-container rounded-2xl border border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface">Recent Activity</h2>
            <span className="material-symbols-outlined text-outline">history</span>
          </div>
          <div className="p-6 overflow-y-auto max-h-[400px] space-y-6">
            {recentLogs?.length === 0 ? (
              <p className="text-center text-on-surface-variant py-4">No recent activity.</p>
            ) : (
              recentLogs?.map((log, i) => (
                <div key={log.id} className="flex gap-4 relative">
                  {/* Timeline line */}
                  {i !== recentLogs.length - 1 && (
                    <div className="absolute top-8 left-[11px] w-0.5 h-full bg-white/5"></div>
                  )}

                  <div className="w-6 h-6 rounded-full bg-surface-variant border-2 border-background flex items-center justify-center shrink-0 mt-1 relative z-10">
                    <div className={`w-2 h-2 rounded-full ${log.action === 'created' ? 'bg-primary' : log.action === 'approved' ? 'bg-success' : log.action.includes('rework') || log.action.includes('unlock') ? 'bg-warning' : 'bg-outline'}`}></div>
                  </div>

                  <div>
                    <p className="text-sm text-on-surface">
                      <strong className="text-primary">{log.profiles?.full_name || 'System'}</strong> {log.action.replace('_', ' ')} a record in <span className="font-mono bg-surface-variant px-1.5 py-0.5 rounded text-xs">{log.table_name}</span>.
                    </p>
                    <p className="text-xs text-outline mt-1">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
