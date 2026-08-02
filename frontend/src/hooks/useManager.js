import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// ─── 1. Team Members + Their Sheets ───────────────────────────────────────────
export const useTeamMembers = (cycleId) => {
  return useQuery({
    queryKey: ['teamMembers', cycleId],
    enabled: !!cycleId,
    queryFn: async () => {
      const { data } = await api.get('/sheets/team');
      // Backend returns { team: [...], sheets: [...] }
      // Merge them into the shape components expect
      const { team = [], sheets = [] } = data;
      return team.map(member => {
        const sheet = sheets.find(s => s.employee_id === member.id) || null;
        return { ...member, goalSheet: sheet, totalWeightage: 0 };
      });
    }
  });
};

// ─── 2. Specific Employee's Goal Sheet ────────────────────────────────────────
export const useEmployeeGoalSheet = (employeeId, cycleId) => {
  return useQuery({
    queryKey: ['employeeGoalSheet', employeeId, cycleId],
    enabled: !!employeeId && !!cycleId,
    queryFn: async () => {
      const [profileRes, teamRes] = await Promise.all([
        api.get(`/users/${employeeId}`),
        api.get('/sheets/team'),
      ]);
      const profile = profileRes.data;
      const sheet = teamRes.data?.sheets?.find(
        s => s.employee_id === employeeId
      ) || null;
      return { profile, sheet };
    }
  });
};

// ─── 3. Approve Goals ─────────────────────────────────────────────────────────
export const useApproveGoalsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sheetId) => {
      const { data } = await api.patch(`/sheets/${sheetId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      queryClient.invalidateQueries(['employeeGoalSheet']);
    }
  });
};

// ─── 4. Return for Rework ─────────────────────────────────────────────────────
export const useReturnForReworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sheetId, comment }) => {
      const { data } = await api.patch(`/sheets/${sheetId}/rework`, {
        manager_comment: comment,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      queryClient.invalidateQueries(['employeeGoalSheet']);
    }
  });
};

// ─── 5. Team Check-ins for a Quarter ─────────────────────────────────────────
export const useTeamCheckins = (cycleId, quarter) => {
  return useQuery({
    queryKey: ['teamCheckins', cycleId, quarter],
    enabled: !!cycleId && !!quarter,
    queryFn: async () => {
      const { data } = await api.get('/sheets/team');
      const { team = [], sheets = [] } = data;

      // For each team member, fetch their goals and achievements
      const results = await Promise.all(
        team.map(async (member) => {
          const sheet = sheets.find(s => s.employee_id === member.id);
          if (!sheet) return { ...member, goalSheet: null, goalsData: [], hasManagerComment: false, existingComment: '' };

          const goalsRes = await api.get(`/goals?sheet_id=${sheet.id}`);
          const goals = goalsRes.data || [];

          const goalIds = goals.map(g => g.id);
          if (!goalIds.length) {
            return { ...member, goalSheet: sheet, goalsData: [], hasManagerComment: false, existingComment: '' };
          }

          const achRes = await api.get(
            `/achievements?goal_ids=${goalIds.join(',')}&quarter=${quarter}`
          );
          const achievements = achRes.data || [];

          let hasComment = false;
          let existingComment = '';
          const goalsData = goals.map(goal => {
            const ach = achievements.find(a => a.goal_id === goal.id) || null;
            if (ach?.manager_comment) {
              hasComment = true;
              existingComment = ach.manager_comment;
            }
            return { goal, achievement: ach };
          });

          return { ...member, goalSheet: sheet, goalsData, hasManagerComment: hasComment, existingComment };
        })
      );

      return results;
    }
  });
};

// ─── 6. Save Check-in Comment ─────────────────────────────────────────────────
export const useSaveCheckinCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ achievementsIds, comment }) => {
      if (!achievementsIds?.length) {
        throw new Error('Employee has no logged achievements for this quarter.');
      }
      const { data } = await api.patch('/achievements/checkin-comment', {
        achievement_ids: achievementsIds,
        manager_comment: comment,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamCheckins']);
    }
  });
};
