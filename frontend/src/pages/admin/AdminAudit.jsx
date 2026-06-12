import React, { useState } from 'react';
import { useAuditLogs } from '../../hooks/useAdmin';

export const AdminAudit = () => {
  const { data: logs, isLoading } = useAuditLogs();
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in relative">
      
      <div>
        <h1 className="text-3xl font-display-md font-bold text-slate-700">Audit Log</h1>
        <p className="text-slate-700-variant font-body-md mt-1">Review system changes, overrides, and approvals.</p>
      </div>

      <div className="bg-surface-container rounded-2xl border border-outline overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Table</th>
                <th className="px-6 py-4 font-mono">Record ID</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {logs?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-700-variant">No audit logs found.</td>
                </tr>
              ) : (
                logs?.map((log) => {
                  const isExpanded = expandedId === log.id;
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`transition-colors ${isExpanded ? 'bg-white/[0.04]' : 'hover:hover:bg-slate-50'}`}>
                        <td className="px-6 py-4 text-slate-700-variant whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {log.profiles?.full_name || 'System'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                            ${log.action.includes('created') ? 'bg-primary/10 text-primary border border-primary/20' : 
                              log.action.includes('approved') ? 'bg-success/10 text-success border border-success/20' : 
                              log.action.includes('unlock') || log.action.includes('rework') ? 'bg-warning/10 text-warning border border-warning/20' : 
                              'bg-surface-variant text-slate-700-variant border border-outline'}`}
                          >
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400 text-xs">{log.table_name}</td>
                        <td className="px-6 py-4 font-mono text-slate-400 text-xs" title={log.record_id}>
                          {log.record_id?.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className={`p-2 rounded-lg transition-colors flex items-center justify-center ml-auto ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-slate-700 hover:bg-slate-200'}`}
                          >
                            <span className={`material-symbols-outlined transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded JSON Payload View */}
                      {isExpanded && (
                        <tr className="bg-surface-container-lowest border-b-2 border-outline animate-fade-in">
                          <td colSpan="6" className="px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Old Data</h4>
                                <div className="bg-[#0D1117] border border-outline p-4 rounded-xl overflow-auto custom-scrollbar max-h-[300px]">
                                  <pre className="text-xs font-mono text-[#FF7B72]">
                                    {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'null'}
                                  </pre>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Data</h4>
                                <div className="bg-[#0D1117] border border-outline p-4 rounded-xl overflow-auto custom-scrollbar max-h-[300px]">
                                  <pre className="text-xs font-mono text-[#7EE787]">
                                    {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'null'}
                                  </pre>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
