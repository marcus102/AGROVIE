import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { QuickStart, QuickStartCreatePayload } from '@/types/quick_starts';

interface QuickStartState {
  quickStarts: QuickStart[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchQuickStarts: () => Promise<void>;
  createQuickStart: (payload: QuickStartCreatePayload) => Promise<QuickStart | null>;
  updateQuickStart: (id: string, updates: Partial<QuickStart>) => Promise<QuickStart | null>;
  deleteQuickStart: (id: string) => Promise<void>;
  incrementUsageCount: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useQuickStartStore = create<QuickStartState>((set, get) => ({
  quickStarts: [],
  loading: false,
  error: null,

  fetchQuickStarts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quick_starts')
        .select('*')
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ quickStarts: data || [] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch quick starts',
      });
    } finally {
      set({ loading: false });
    }
  },

  createQuickStart: async (payload: QuickStartCreatePayload) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('quick_starts')
        .insert([
          {
            ...payload,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        quickStarts: [data, ...state.quickStarts],
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create quick start',
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateQuickStart: async (id: string, updates: Partial<QuickStart>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quick_starts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        quickStarts: state.quickStarts.map((qs) => (qs.id === id ? data : qs)),
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update quick start',
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuickStart: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('quick_starts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        quickStarts: state.quickStarts.filter((qs) => qs.id !== id),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete quick start',
      });
    } finally {
      set({ loading: false });
    }
  },

  incrementUsageCount: async (id: string) => {
    try {
      const { error } = await supabase.rpc('increment_usage_count', {
        quick_start_id: id,
      });

      if (error) throw error;

      // Update local state
      set((state) => ({
        quickStarts: state.quickStarts.map((qs) =>
          qs.id === id ? { ...qs, usage_count: qs.usage_count + 1 } : qs
        ),
      }));
    } catch (error) {
      console.error('Failed to increment usage count:', error);
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));