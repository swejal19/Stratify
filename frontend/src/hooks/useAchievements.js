import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useQuarterAchievements = (cycleId, quarter) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievements', cycleId, quarter],
    enabled: !!cycleId && !!quarter && !!user?.id,
    queryFn: async () => {
      // Fetch achievements for the cycle and quarter
      // Assuming RLS restricts to the user's own goals/achievements
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('cycle_id', cycleId)
        .eq('quarter', quarter);

      if (error) throw error;
      return data || [];
    }
  });
};

export const useUpsertAchievementMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (achievementPayload) => {
      // payload expects: id (optional), goal_id, quarter, cycle_id, actual, actual_date, status, employee_note, etc.
      
      let res;
      if (achievementPayload.id) {
        // Update existing
        res = await supabase
          .from('achievements')
          .update(achievementPayload)
          .eq('id', achievementPayload.id)
          .select()
          .single();
      } else {
        // Insert new
        res = await supabase
          .from('achievements')
          .insert([achievementPayload])
          .select()
          .single();
      }

      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['achievements', variables.cycle_id, variables.quarter]);
    }
  });
};
