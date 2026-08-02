import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// ─── Quarter Achievements (by comma-separated goal IDs) ───────────────────────
export const useQuarterAchievements = (goalIds, quarter) => {
  const ids = goalIds?.join(',');

  return useQuery({
    queryKey: ['achievements', ids, quarter],
    enabled: !!ids && !!quarter,
    queryFn: async () => {
      const { data } = await api.get(
        `/achievements?goal_ids=${ids}&quarter=${quarter}`
      );
      return data || [];
    }
  });
};

// ─── Upsert Achievement ───────────────────────────────────────────────────────
export const useUpsertAchievementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (achievementPayload) => {
      const { data } = await api.post('/achievements/upsert', achievementPayload);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'achievements',
        undefined,
        variables.quarter,
      ]);
    }
  });
};
