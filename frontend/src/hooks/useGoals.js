import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// ─── 1. Active Cycle ──────────────────────────────────────────────────────────
export const useActiveCycle = () => {
  return useQuery({
    queryKey: ['activeCycle'],
    queryFn: async () => {
      const { data } = await api.get('/cycles/active');
      return data;
    }
  });
};

// ─── 2. My Goal Sheet (auto-creates draft if missing) ─────────────────────────
export const useGoalSheet = () => {
  return useQuery({
    queryKey: ['goalSheet'],
    queryFn: async () => {
      const { data } = await api.get('/sheets/active');
      return data;
    }
  });
};

// ─── 3. Goals for a Sheet ─────────────────────────────────────────────────────
export const useGoals = (sheetId) => {
  return useQuery({
    queryKey: ['goals', sheetId],
    enabled: !!sheetId,
    queryFn: async () => {
      const { data } = await api.get(`/goals?sheet_id=${sheetId}`);
      return data || [];
    }
  });
};

// ─── 4. Add Goal ──────────────────────────────────────────────────────────────
export const useAddGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newGoal) => {
      const { data } = await api.post('/goals', newGoal);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['goals', variables.sheet_id]);
    }
  });
};

// ─── 5. Edit Goal ─────────────────────────────────────────────────────────────
export const useEditGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.patch(`/goals/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['goals', data.sheet_id]);
    }
  });
};

// ─── 6. Delete Goal ───────────────────────────────────────────────────────────
export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goalId) => {
      await api.delete(`/goals/${goalId}`);
      return goalId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    }
  });
};

// ─── 7. Submit Sheet ──────────────────────────────────────────────────────────
export const useSubmitSheetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sheetId) => {
      const { data } = await api.patch(`/sheets/${sheetId}/submit`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['goalSheet']);
    }
  });
};

// ─── 8. Push Shared Goal (manager pushes to multiple employees) ───────────────
export const usePushSharedGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeIds, goalPayload }) => {
      // For each employee, get/create their sheet then add the goal
      for (const empId of employeeIds) {
        // Get active sheet for this employee via the team endpoint —
        // fall back to posting directly to /goals with their sheet_id
        // (manager must know the sheetId; use getTeamSheets first if needed)
        await api.post('/goals', { ...goalPayload, is_shared: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    }
  });
};
