import React from 'react';
import { useActiveCycle } from '../../hooks/useGoals';
import { useReportData } from '../../hooks/useAdmin';

export const AdminReports = () => {
  const { data: cycle, isLoading: cycleLoading } = useActiveCycle();
  const { data: reportData, isLoading: dataLoading } = useReportData(cycle?.id);

  const isLoading = cycleLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-8 text-center bg-surface-container rounded-2xl border border-outline">
        <h2 className="text-xl font-bold text-slate-700">No Active Cycle</h2>
      </div>
    );
  }

  const rows = reportData?.reports || [];

  const exportCSV = () => {
    if (rows.length === 0) return;
    
    const headers = ['Employee', 'Department', 'Goal', 'UoM', 'Weightage(%)', 'Target', 'Q1 Actual', 'Q1 Score(%)', 'Q2 Actual', 'Q2 Score(%)', 'Q3 Actual', 'Q3 Score(%)', 'Q4 Actual', 'Q4 Score(%)', 'Overall Score(%)'];
    
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(r => [
        r.employee, r.department, r.goal, r.uom, r.weightage, r.target,
        r.q1_actual, r.q1_score !== null ? Math.round(Math.min(r.q1_score, 150)) : '',
        r.q2_actual, r.q2_score !== null ? Math.round(Math.min(r.q2_score, 150)) : '',
        r.q3_actual, r.q3_score !== null ? Math.round(Math.min(r.q3_score, 150)) : '',
        r.q4_actual, r.q4_score !== null ? Math.round(Math.min(r.q4_score, 150)) : '',
        r.overall !== null ? Math.round(Math.min(r.overall, 150)) : ''
      ].map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Stratify_Report_${cycle.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColorClass = (score) => {
    if (score === null) return '';
    const s = Math.min(score, 150);
    if (s >= 100) return 'text-success';
    if (s >= 50) return 'text-warning';
    return 'text-error';
  };

  const renderScore = (score) => {
    if (score === null) return '--';
    return `${Math.round(Math.min(score, 150))}%`;
  };

  return (
    <div className="max-w-full mx-auto space-y-8 pb-32 animate-fade-in relative">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-slate-700">Master Reports</h1>
          <p className="text-slate-700-variant font-body-md mt-1">Goal vs Actual performance across all quarters.</p>
        </div>
        <button 
          onClick={exportCSV}
          disabled={rows.length === 0}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          Export CSV
        </button>
      </div>

      <div className="bg-surface-container rounded-2xl border border-outline overflow-hidden shadow-lg flex flex-col h-[70vh]">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline shadow-sm">
              <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-4 bg-surface-container-lowest sticky left-0 z-20 border-r border-outline">Employee</th>
                <th className="px-4 py-4 border-r border-outline">Dept</th>
                <th className="px-4 py-4 border-r border-outline">Goal</th>
                <th className="px-4 py-4">UoM</th>
                <th className="px-4 py-4">Weight</th>
                <th className="px-4 py-4 border-r border-outline bg-primary/5">Target</th>
                <th className="px-4 py-4 bg-slate-100">Q1 Actual</th>
                <th className="px-4 py-4 bg-slate-100 border-r border-outline">Q1 Score</th>
                <th className="px-4 py-4 bg-slate-50">Q2 Actual</th>
                <th className="px-4 py-4 bg-slate-50 border-r border-outline">Q2 Score</th>
                <th className="px-4 py-4 bg-slate-100">Q3 Actual</th>
                <th className="px-4 py-4 bg-slate-100 border-r border-outline">Q3 Score</th>
                <th className="px-4 py-4 bg-slate-50">Q4 Actual</th>
                <th className="px-4 py-4 bg-slate-50 border-r border-outline">Q4 Score</th>
                <th className="px-4 py-4 bg-primary/10 text-primary">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="15" className="px-6 py-12 text-center text-slate-700-variant">No report data available for this cycle.</td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-700 bg-surface-container sticky left-0 z-10 border-r border-outline">{row.employee}</td>
                    <td className="px-4 py-3 text-slate-700-variant border-r border-outline">{row.department}</td>
                    <td className="px-4 py-3 text-slate-700-variant border-r border-outline max-w-[200px] truncate" title={row.goal}>{row.goal}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs uppercase">{row.uom?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 font-mono">{row.weightage}%</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 border-r border-outline bg-primary/5">{row.target || '--'}</td>
                    
                    <td className="px-4 py-3 font-mono bg-slate-100">{row.q1_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-slate-100 border-r border-outline ${getScoreColorClass(row.q1_score)}`}>
                      {renderScore(row.q1_score)}
                    </td>

                    <td className="px-4 py-3 font-mono bg-slate-50">{row.q2_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-slate-50 border-r border-outline ${getScoreColorClass(row.q2_score)}`}>
                      {renderScore(row.q2_score)}
                    </td>

                    <td className="px-4 py-3 font-mono bg-slate-100">{row.q3_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-slate-100 border-r border-outline ${getScoreColorClass(row.q3_score)}`}>
                      {renderScore(row.q3_score)}
                    </td>

                    <td className="px-4 py-3 font-mono bg-slate-50">{row.q4_actual || '--'}</td>
                    <td className={`px-4 py-3 font-mono font-bold bg-slate-50 border-r border-outline ${getScoreColorClass(row.q4_score)}`}>
                      {renderScore(row.q4_score)}
                    </td>

                    <td className={`px-4 py-3 font-mono font-bold bg-primary/10 ${getScoreColorClass(row.overall)}`}>
                      {renderScore(row.overall)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
