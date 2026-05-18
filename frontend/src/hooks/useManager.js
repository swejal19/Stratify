import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// 1. Fetch team members and their goal sheets for a given cycle
export const useTeamMembers = (cycleId) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teamMembers', cycleId],
    enabled: !!cycleId && !!user?.id,
    queryFn: async () => {
      // Step 1: Get profiles managed by this user
      const { data: team, error: teamError } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', user.id);

      if (teamError) throw teamError;
      if (!team || team.length === 0) return [];

      const teamIds = team.map(t => t.id);

      // Step 2: Get goal sheets for these employees in the current cycle
      const { data: sheets, error: sheetsError } = await supabase
        .from('goal_sheets')
        .select(`
          *,
          goals (
            weightage
          )
        `)
        .in('employee_id', teamIds)
        .eq('cycle_id', cycleId);

      if (sheetsError) throw sheetsError;

      // Step 3: Merge data
      return team.map(member => {
        const sheet = sheets?.find(s => s.employee_id === member.id);
        const totalWeightage = sheet?.goals?.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0) || 0;
        
        return {
          ...member,
          goalSheet: sheet || null,
          totalWeightage
        };
      });
    }
  });
};

// 2. Fetch a specific employee's goal sheet
export const useEmployeeGoalSheet = (employeeId, cycleId) => {
  return useQuery({
    queryKey: ['employeeGoalSheet', employeeId, cycleId],
    enabled: !!employeeId && !!cycleId,
    queryFn: async () => {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', employeeId)
        .single();
      
      if (profileError) throw profileError;

      // Get sheet
      const { data: sheet, error: sheetError } = await supabase
        .from('goal_sheets')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('cycle_id', cycleId)
        .maybeSingle();

      if (sheetError) throw sheetError;

      return { profile, sheet };
    }
  });
};

// 3. Manager Approve Mutation
export const useApproveGoalsMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (sheetId) => {
      // Update goal sheet
      const { data, error } = await supabase
        .from('goal_sheets')
        .update({ 
          status: 'locked', 
          approved_by: user.id, 
          approved_at: new Date().toISOString() 
        })
        .eq('id', sheetId)
        .select()
        .single();
        
      if (error) throw error;

      // Insert Audit Log
      await supabase.from('audit_logs').insert([{
        table_name: 'goal_sheets',
        record_id: sheetId,
        action: 'approved',
        changed_by: user.id,
        new_data: { status: 'locked' }
      }]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      queryClient.invalidateQueries(['employeeGoalSheet']);
    }
  });
};

// 4. Manager Rework Mutation
export const useReturnForReworkMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ sheetId, comment }) => {
      const { data, error } = await supabase
        .from('goal_sheets')
        .update({ 
          status: 'rework', 
          manager_comment: comment 
        })
        .eq('id', sheetId)
        .select()
        .single();
        
      if (error) throw error;

      // Insert Audit Log
      await supabase.from('audit_logs').insert([{
        table_name: 'goal_sheets',
        record_id: sheetId,
        action: 'returned_for_rework',
        changed_by: user.id,
        new_data: { status: 'rework', manager_comment: comment }
      }]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      queryClient.invalidateQueries(['employeeGoalSheet']);
    }
  });
};

// 5. Fetch team check-ins for a specific quarter
export const useTeamCheckins = (cycleId, quarter) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teamCheckins', cycleId, quarter],
    enabled: !!cycleId && !!quarter && !!user?.id,
    queryFn: async () => {
      // Step 1: Get team profiles
      const { data: team, error: teamError } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', user.id);

      if (teamError) throw teamError;
      if (!team || team.length === 0) return [];

      const teamIds = team.map(t => t.id);

      // Step 2: Get sheets + goals
      const { data: sheets, error: sheetsError } = await supabase
        .from('goal_sheets')
        .select(`
          *,
          goals (*)
        `)
        .in('employee_id', teamIds)
        .eq('cycle_id', cycleId);

      if (sheetsError) throw sheetsError;

      // Step 3: Get achievements for this quarter
      const { data: achievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .eq('cycle_id', cycleId)
        .eq('quarter', quarter);

      if (achError) throw achError;

      // Step 4: Merge
      return team.map(member => {
        const sheet = sheets?.find(s => s.employee_id === member.id);
        const goals = sheet?.goals || [];
        
        let hasComment = false;
        let existingComment = '';
        const memberAchievements = goals.map(g => {
          const ach = achievements?.find(a => a.goal_id === g.id);
          if (ach?.manager_comment) {
            hasComment = true;
            existingComment = ach.manager_comment;
          }
          return { goal: g, achievement: ach || null };
        });

        return {
          ...member,
          goalSheet: sheet || null,
          goalsData: memberAchievements,
          hasManagerComment: hasComment,
          existingComment
        };
      });
    }
  });
};

// 6. Save Check-in Comment
export const useSaveCheckinCommentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cycleId, quarter, achievementsIds, comment }) => {
      // Update manager_comment for all passed achievement IDs
      if (!achievementsIds || achievementsIds.length === 0) {
        throw new Error("Employee has no logged achievements for this quarter.");
      }

      const { data, error } = await supabase
        .from('achievements')
        .update({ manager_comment: comment })
        .in('id', achievementsIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamCheckins']);
    }
  });
};
