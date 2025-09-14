import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { MissionTracking, MissionEmployee } from '@/types/mission_tracking';

interface MissionTrackingState {
  tracking: MissionTracking | null;
  employees: MissionEmployee[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMissionTracking: (missionId: string, userId: string) => Promise<void>;
  fetchMissionEmployees: (missionId: string) => Promise<void>;
  updateTracking: (trackingId: string, updates: Partial<MissionTracking>) => Promise<void>;
  startTracking: (missionId: string, userId: string) => Promise<void>;
  pauseTracking: (trackingId: string) => Promise<void>;
  resumeTracking: (trackingId: string) => Promise<void>;
  completeTracking: (trackingId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMissionTrackingStore = create<MissionTrackingState>((set, get) => ({
  tracking: null,
  employees: [],
  loading: false,
  error: null,

  fetchMissionTracking: async (missionId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mission_tracking')
        .select('*')
        .eq('mission_id', missionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      set({ tracking: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tracking' });
    } finally {
      set({ loading: false });
    }
  },

  fetchMissionEmployees: async (missionId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mission_tracking')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            profile_picture,
            role,
            specialization
          )
        `)
        .eq('mission_id', missionId);

      if (error) throw error;
      
      const employees = data?.map(tracking => ({
        id: tracking.id,
        mission_id: tracking.mission_id,
        user_id: tracking.user_id,
        profile: tracking.profiles,
        tracking,
        status: tracking.status,
        joined_at: tracking.created_at,
      })) || [];

      set({ employees });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch employees' });
    } finally {
      set({ loading: false });
    }
  },

  updateTracking: async (trackingId: string, updates: Partial<MissionTracking>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mission_tracking')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', trackingId)
        .select()
        .single();

      if (error) throw error;
      set({ tracking: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update tracking' });
    } finally {
      set({ loading: false });
    }
  },

  startTracking: async (missionId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mission_tracking')
        .insert({
          mission_id: missionId,
          user_id: userId,
          start_time: new Date().toISOString(),
          completion_rate: 0,
          time_worked: 0,
          earnings: 0,
          status: 'active',
          tasks_completed: 0,
          total_tasks: 10, // Default value
          metadata: {},
        })
        .select()
        .single();

      if (error) throw error;
      set({ tracking: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start tracking' });
    } finally {
      set({ loading: false });
    }
  },

  pauseTracking: async (trackingId: string) => {
    await get().updateTracking(trackingId, { status: 'paused' });
  },

  resumeTracking: async (trackingId: string) => {
    await get().updateTracking(trackingId, { status: 'active' });
  },

  completeTracking: async (trackingId: string) => {
    await get().updateTracking(trackingId, { 
      status: 'completed',
      end_time: new Date().toISOString(),
      completion_rate: 100
    });
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));