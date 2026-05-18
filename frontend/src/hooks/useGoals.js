import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// 1. Fetch the active cycle
export const useActiveCycle = () => {
  return useQuery({
    queryKey: ['activeCycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    }
  });
};

// 2. Fetch or create goal sheet
export const useGoalSheet = (cycleId) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['goalSheet', cycleId, user?.id],
    enabled: !!cycleId && !!user?.id,
    queryFn: async () => {
      // First, try to fetch the existing sheet
      const { data: existingSheet, error: fetchError } = await supabase
        .from('goal_sheets')
        .select('*')
        .eq('employee_id', user.id)
        .eq('cycle_id', cycleId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingSheet) {
        return existingSheet;
      }

      // If it doesn't exist, auto-create a draft sheet
      const { data: newSheet, error: insertError } = await supabase
        .from('goal_sheets')
        .insert([
          { 
            employee_id: user.id, 
            cycle_id: cycleId, 
            status: 'draft' 
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return newSheet;
    }
  });
};

// 3. Fetch goals for a sheet
export const useGoals = (sheetId) => {
  return useQuery({
    queryKey: ['goals', sheetId],
    enabled: !!sheetId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('sheet_id', sheetId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    }
  });
};

// 4. Mutations
export const useAddGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newGoal) => {
      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['goals', variables.sheet_id]);
    }
  });
};

export const useEditGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['goals', data.sheet_id]);
    }
  });
};

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goalId) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      if (error) throw error;
      return goalId;
    },
    onSuccess: (data, variables) => {
      // Invalidate all goals queries just to be safe, since we might not have sheetId here directly
      queryClient.invalidateQueries(['goals']);
    }
  });
};

export const useSubmitSheetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sheetId) => {
      const { data, error } = await supabase
        .from('goal_sheets')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', sheetId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, sheetId) => {
      // Invalidate the specific goal sheet query
      // We can't invalidate by exact key without user id, so we invalidate all goalSheets
      queryClient.invalidateQueries(['goalSheet']);
    }
  });
};

export const usePushSharedGoalMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ cycleId, employeeIds, goalPayload }) => {
      if (!employeeIds.length) return;

      // 1. Fetch or create sheets for all these employees for this cycle
      for (const empId of employeeIds) {
        let sheetId;
        const { data: existingSheet } = await supabase
          .from('goal_sheets')
          .select('id')
          .eq('employee_id', empId)
          .eq('cycle_id', cycleId)
          .maybeSingle();

        if (existingSheet) {
          sheetId = existingSheet.id;
        } else {
          const { data: newSheet, error: sheetErr } = await supabase
            .from('goal_sheets')
            .insert([{ employee_id: empId, cycle_id: cycleId, status: 'draft' }])
            .select('id')
            .single();
          if (sheetErr) throw sheetErr;
          sheetId = newSheet.id;
        }

        // 2. Check current goal count
        const { count, error: countErr } = await supabase
          .from('goals')
          .select('*', { count: 'exact', head: true })
          .eq('sheet_id', sheetId);
        
        if (countErr) throw countErr;
        
        if (count >= 8) {
          continue;
        }

        // 3. Insert the shared goal
        const { data: insertedGoal, error: insertErr } = await supabase
          .from('goals')
          .insert([{
            ...goalPayload,
            sheet_id: sheetId,
            is_shared: true,
            shared_from: null
          }])
          .select('id')
          .single();
          
        if (insertErr) throw insertErr;

        // 4. Audit Log
        await supabase.from('audit_logs').insert([{
          table_name: 'goals',
          record_id: insertedGoal.id,
          action: 'shared_goal_pushed',
          changed_by: user.id,
          new_data: { is_shared: true, employee_id: empId, title: goalPayload.title }
        }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      queryClient.invalidateQueries(['adminDashboard']);
    }
  });
};

