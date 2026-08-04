import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export const useAdminDashboardData = (cycleId) => {
  return useQuery({
    queryKey: ['adminDashboard', cycleId],
    enabled: !!cycleId,
    queryFn: async () => {
      // Fetch all users and team sheets in parallel
      const [usersRes, sheetsRes, auditRes, reportsRes, accessReqRes] = await Promise.all([
        api.get('/users'),
        api.get('/sheets/team'),
        api.get('/audit'),
        api.get(`/reports?cycle_id=${cycleId}`),
        api.get('/admin/access-requests?status=pending')
      ]);

      const profiles = usersRes.data || [];
      const employees = profiles.filter(p => p.role === 'employee');
      const sheets = sheetsRes.data?.sheets || [];
      const recentLogs = (auditRes.data || []).slice(0, 10);
      const reports = reportsRes.data?.reports || [];
      const analytics = reportsRes.data?.analytics || {};
      const pendingRequests = accessReqRes.data?.length || 0;

      return { profiles, employees, sheets, recentLogs, reports, analytics, pendingRequests };
    }
  });
};

// ─── Report Data ──────────────────────────────────────────────────────────────
export const useReportData = (cycleId) => {
  return useQuery({
    queryKey: ['adminReport', cycleId],
    enabled: !!cycleId,
    queryFn: async () => {
      const { data } = await api.get(`/reports?cycle_id=${cycleId}`);
      return data || [];
    }
  });
};

// ─── All Cycles ───────────────────────────────────────────────────────────────
export const useAllCycles = () => {
  return useQuery({
    queryKey: ['adminCycles'],
    queryFn: async () => {
      const { data } = await api.get('/cycles');
      return data;
    }
  });
};

// ─── Create Cycle ─────────────────────────────────────────────────────────────
export const useUpsertCycleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cycleData) => {
      const { data } = await api.post('/cycles', cycleData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminCycles', 'activeCycle'])
  });
};

// ─── Toggle Cycle Active State ────────────────────────────────────────────────
export const useToggleCycleStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cycleId, makeActive }) => {
      const { data } = await api.patch(`/cycles/${cycleId}/toggle`, { makeActive });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminCycles', 'activeCycle'])
  });
};

// ─── All Profiles ─────────────────────────────────────────────────────────────
export const useAllProfiles = () => {
  return useQuery({
    queryKey: ['adminProfiles'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    }
  });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.patch(`/users/${id}`, updates);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminProfiles'])
  });
};

// ─── Admin Unlock Goals (reset sheet to draft) ────────────────────────────────
export const useAdminUnlockGoalsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sheetId) => {
      // Reuse the rework endpoint with an admin override flag
      const { data } = await api.patch(`/sheets/${sheetId}/rework`, {
        manager_comment: 'Admin override: sheet returned to draft for editing.',
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminDashboard'])
  });
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const { data } = await api.get('/audit');
      return data;
    }
  });
};
