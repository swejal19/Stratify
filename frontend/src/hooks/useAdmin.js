import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getCurrentQuarter } from '../utils/achievementUtils';

// --- Dashboard & Reports ---

export const useAdminDashboardData = (cycleId) => {
  return useQuery({
    queryKey: ['adminDashboard', cycleId],
    enabled: !!cycleId,
    queryFn: async () => {
      // 1. Get all profiles
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (pError) throw pError;

      const employees = profiles.filter(p => p.role === 'employee'); // Usually everyone can have goals

      // 2. Get all sheets for the active cycle
      const { data: sheets, error: sError } = await supabase
        .from('goal_sheets')
        .select('*')
        .eq('cycle_id', cycleId);
      if (sError) throw sError;

      // 3. Get recent audit logs
      const { data: recentLogs, error: lError } = await supabase
        .from('audit_logs')
        .select('*, profiles:changed_by(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (lError) throw lError;

      // 4. Get current cycle to determine quarter for check-in rate
      const { data: cycle, error: cError } = await supabase
        .from('cycles')
        .select('*')
        .eq('id', cycleId)
        .single();
      if (cError) throw cError;

      const currentQuarterInfo = getCurrentQuarter(cycle);
      const currentQuarter = currentQuarterInfo.quarter;

      // 5. Get achievements for current quarter that have manager_comment
      const { data: checkinAchievements, error: caError } = await supabase
        .from('achievements')
        .select('id, goal_id, manager_comment')
        .not('manager_comment', 'is', null)
        .eq('quarter', currentQuarter);
      if (caError) throw caError;

      // 6. Count unique employees who have manager_comment
      let checkinRate = 0;
      if (checkinAchievements?.length > 0) {
        const goalIds = checkinAchievements.map(a => a.goal_id);

        // Get goal sheets for these goals
        const { data: checkinGoals, error: cgError } = await supabase
          .from('goals')
          .select('id, sheet_id')
          .in('id', goalIds);
        if (cgError) throw cgError;

        const sheetIds = [...new Set(checkinGoals?.map(g => g.sheet_id).filter(Boolean))];

        if (sheetIds.length > 0) {
          const { data: checkinSheets, error: csError } = await supabase
            .from('goal_sheets')
            .select('id, employee_id')
            .in('id', sheetIds);
          if (csError) throw csError;

          const uniqueEmployeeIds = [...new Set(checkinSheets?.map(s => s.employee_id).filter(Boolean))];
          const checkedInEmployees = uniqueEmployeeIds.length;
          const totalEmployees = employees.length;

          checkinRate = totalEmployees > 0 ? (checkedInEmployees / totalEmployees) * 100 : 0;
        }
      }

      return { profiles, employees, sheets, recentLogs, checkinRate };
    }
  });
};

export const useReportData = (cycleId) => {
  return useQuery({
    queryKey: ['adminReport', cycleId],
    enabled: !!cycleId,
    queryFn: async () => {
      // Fetch everything to join client-side
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, department, role');
      if (pErr) throw pErr;

      const { data: sheets, error: sErr } = await supabase
        .from('goal_sheets')
        .select('id, employee_id')
        .eq('cycle_id', cycleId);
      if (sErr) throw sErr;

      const sheetIds = sheets?.map(s => s.id) || [];

      let goals = [];
      if (sheetIds.length > 0) {
        const { data: g, error: gErr } = await supabase
          .from('goals')
          .select('id, sheet_id, title, uom, target, target_date, weightage, thrust_area, is_shared')
          .in('sheet_id', sheetIds);
        if (gErr) throw gErr;
        goals = g || [];
      }

      // Query achievements by goal_id array — more reliable than cycle_id
      const goalIds = goals.map(g => g.id);
      let achievements = [];
      if (goalIds.length > 0) {
        const { data: ach, error: aErr } = await supabase
          .from('achievements')
          .select('id, goal_id, quarter, actual, actual_date, status, manager_comment')
          .in('goal_id', goalIds);
        if (aErr) throw aErr;
        achievements = ach || [];
      }

      return { profiles, sheets, goals, achievements };
    }
  });
};



// --- Cycles ---

export const useAllCycles = () => {
  return useQuery({
    queryKey: ['adminCycles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cycles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
};

export const useUpsertCycleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cycleData) => {
      const { data, error } = await supabase.from('cycles').upsert([cycleData]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminCycles', 'activeCycle'])
  });
};

export const useToggleCycleStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cycleId, makeActive }) => {
      // If we are making one active, we need to deactivate all others first
      if (makeActive) {
        // First get all cycles to find their IDs
        const { data: allCycles, error: fetchError } = await supabase.from('cycles').select('id');
        if (fetchError) throw fetchError;

        // Deactivate all other cycles
        if (allCycles?.length > 0) {
          const otherCycleIds = allCycles.filter(c => c.id !== cycleId).map(c => c.id);
          if (otherCycleIds.length > 0) {
            const { error: deactivateError } = await supabase
              .from('cycles')
              .update({ is_active: false })
              .in('id', otherCycleIds);
            if (deactivateError) throw deactivateError;
          }
        }
      }
      const { data, error } = await supabase.from('cycles').update({ is_active: makeActive }).eq('id', cycleId).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminCycles', 'activeCycle'])
  });
};

// --- Users ---

export const useAllProfiles = () => {
  return useQuery({
    queryKey: ['adminProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminProfiles'])
  });
};

export const useAdminUnlockGoalsMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (employeeId) => {
      // Find their active sheet
      const { data: activeCycle } = await supabase.from('cycles').select('id').eq('is_active', true).single();
      if (!activeCycle) throw new Error("No active cycle");

      const { data: sheet, error: fetchError } = await supabase
        .from('goal_sheets')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('cycle_id', activeCycle.id)
        .single();

      if (fetchError || !sheet) throw new Error("Could not find goal sheet");

      // Update to draft
      const { data, error } = await supabase.from('goal_sheets').update({ status: 'draft' }).eq('id', sheet.id).select();
      if (error) throw error;

      // Log action
      await supabase.from('audit_logs').insert([{
        table_name: 'goal_sheets',
        record_id: sheet.id,
        action: 'admin_unlock',
        changed_by: user.id,
        new_data: { status: 'draft', admin_overriden: true }
      }]);

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminDashboard'])
  });
};

// --- Audit ---

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles:changed_by(full_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });
};
