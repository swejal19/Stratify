import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export const AdminAccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [processingId, setProcessingId] = useState(null);
  
  // Modals state
  const [approveModal, setApproveModal] = useState({ isOpen: false, data: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, requestId: null, reason: '' });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/access-requests?status=${filter}`);
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const response = await api.patch(`/admin/access-requests/${id}/approve`);
      if (response.success) {
        setApproveModal({ isOpen: true, data: response.data });
        fetchRequests(); // Refresh list
      }
    } catch (err) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setProcessingId(rejectModal.requestId);
    try {
      const response = await api.patch(`/admin/access-requests/${rejectModal.requestId}/reject`, {
        rejection_reason: rejectModal.reason
      });
      if (response.success) {
        setRejectModal({ isOpen: false, requestId: null, reason: '' });
        fetchRequests();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const copyCredentials = async (data) => {
    const text = `Email: ${data.email}\nTemporary Password: ${data.temporary_password}\nRole: ${data.role}`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Credentials copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-fade-in relative">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-slate-700">Access Requests</h1>
          <p className="text-slate-700-variant font-body-md mt-1">Review and manage employee onboarding requests.</p>
        </div>
        
        <div className="flex bg-surface-variant p-1 rounded-xl">
          {['all', 'pending', 'approved', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`relative px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === tab ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
              {tab === 'pending' && pendingCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container rounded-2xl border border-outline overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Name & Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Manager Email</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-700-variant">
                    No {filter !== 'all' ? filter : ''} requests found.
                  </td>
                </tr>
              ) : (
                requests.map(request => (
                  <tr key={request.id} className="hover:hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{request.full_name}</div>
                      <div className="text-xs text-slate-700-variant">{request.email}</div>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium">{request.role}</td>
                    <td className="px-6 py-4 text-slate-700-variant">{request.department || '--'}</td>
                    <td className="px-6 py-4 text-slate-700-variant">{request.manager_email || '--'}</td>
                    <td className="px-6 py-4 text-slate-700-variant">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                        ${request.status === 'approved' ? 'bg-success/10 text-success border border-success/20' : 
                          request.status === 'rejected' ? 'bg-error/10 text-error border border-error/20' : 
                          'bg-warning/10 text-warning border border-warning/20'}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {request.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            className="px-3 py-1.5 rounded bg-success/10 text-success hover:bg-success/20 font-bold text-xs transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModal({ isOpen: true, requestId: request.id, reason: '' })}
                            disabled={processingId === request.id}
                            className="px-3 py-1.5 rounded bg-error/10 text-error hover:bg-error/20 font-bold text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Success Modal */}
      {approveModal.isOpen && approveModal.data && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]" onClick={() => setApproveModal({ isOpen: false, data: null })} />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="w-full max-w-md bg-surface-container border border-outline rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <span className="material-symbols-outlined text-success text-5xl">check_circle</span>
                <h2 className="text-2xl font-bold text-slate-700">Account Created!</h2>
                <p className="text-sm text-slate-700-variant">
                  Share these credentials securely with the user. They will be required to change this password on first login.
                </p>
              </div>

              <div className="bg-surface-variant rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                  <p className="font-mono text-slate-700">{approveModal.data.email}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Temporary Password</label>
                  <p className="font-mono font-bold text-slate-700">{approveModal.data.temporary_password}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setApproveModal({ isOpen: false, data: null })}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-700 bg-surface-variant hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => copyCredentials(approveModal.data)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]" onClick={() => setRejectModal({ isOpen: false, requestId: null, reason: '' })} />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="w-full max-w-md bg-surface-container border border-outline rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-700">Reject Request</h2>
                <p className="text-sm text-slate-700-variant">Are you sure you want to reject this access request?</p>
              </div>

              <form onSubmit={handleReject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase block">Rejection Reason (Optional)</label>
                  <textarea
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    className="w-full bg-surface-variant border border-outline rounded-xl p-4 text-slate-700 focus:outline-none focus:border-error transition-all resize-none h-24 text-sm"
                    placeholder="Provide a reason for rejection..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectModal({ isOpen: false, requestId: null, reason: '' })}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-surface-variant hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === rejectModal.requestId}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-error hover:bg-error/90 transition-colors shadow-lg"
                  >
                    {processingId === rejectModal.requestId ? 'Rejecting...' : 'Reject Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
