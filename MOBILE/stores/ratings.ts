import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { UserRating, SystemRating } from '@/types/ratings';

interface RatingState {
  userAverageRating: number | null;
  systemAverageRating: number | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchAverageSystemRating: () => Promise<number | null>;
  fetchAverageUserRating: (ratedUserId: string) => Promise<number | null>;
  createUserRating: (
    rating: Omit<UserRating, 'id' | 'created_at'>
  ) => Promise<UserRating | null>;
  createSystemRating: (
    rating: Omit<SystemRating, 'id' | 'created_at'>
  ) => Promise<SystemRating | null>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  canRateMission: (missionId: string, userId: string) => Promise<boolean>;
}

export const useRatingStore = create<RatingState>((set) => ({
  userAverageRating: null,
  systemAverageRating: null,
  loading: false,
  error: null,

  fetchAverageSystemRating: async () => {
    set({ loading: true, error: null });

    try {
      const { data: systemRatings, error: systemError } = await supabase
        .from('system_ratings')
        .select('rating');

      if (systemError) throw systemError;

      // Combine all ratings for calculation
      const systemRratings = systemRatings || [];

      // Calculate average rating
      let result = 0;
      if (systemRratings.length > 0) {
        const sum = systemRratings.reduce((acc, item) => acc + item.rating, 0);
        result = Number((sum / systemRratings.length).toFixed(1));
      }

      set({ systemAverageRating: result });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch system ratings';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchAverageUserRating: async (ratedUserId) => {
    set({ loading: true, error: null });

    try {
      // Combine both user and system ratings for the average
      const { data: userRatings, error: userError } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('rated_user_id', ratedUserId);

      if (userError) throw userError;

      // Combine all ratings for calculation
      const userRating = userRatings || [];

      // Calculate average rating
      let result = 0;
      if (userRating.length > 0) {
        const sum = userRating.reduce((acc, item) => acc + item.rating, 0);
        result = Number((sum / userRating.length).toFixed(1));
      }

      set({ userAverageRating: result });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch user ratings';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createUserRating: async (rating) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .insert([
          {
            ...rating,
            rater_id:
              rating.rater_id || (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select('*');

      if (error) throw error;

      // Update average rating after creating new rating
      if (data?.[0]) {
        await useRatingStore
          .getState()
          .fetchAverageUserRating(rating.rated_user_id);
      }

      return (data?.[0] as UserRating) || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create user rating';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createSystemRating: async (rating) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('system_ratings')
        .insert([
          {
            ...rating,
            user_id:
              rating.user_id || (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select('*');

      if (error) throw error;

      // Update average rating after creating new system rating
      if (data?.[0]) {
        await useRatingStore.getState().fetchAverageSystemRating();
      }

      return (data?.[0] as SystemRating) || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create system rating';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  canRateMission: async (
    missionId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      // Check if mission is completed
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('status, end_date')
        .eq('id', missionId)
        .single();

      if (missionError) throw missionError;

      const isCompleted =
        mission.status === 'completed' ||
        new Date(mission.end_date) < new Date();
      if (!isCompleted) return false;

      // Check if user already rated this mission
      const { data: existingRating, error: ratingError } = await supabase
        .from('user_ratings')
        .select('id')
        .eq('mission_id', missionId)
        .eq('rater_id', userId)
        .single();

      if (ratingError && ratingError.code !== 'PGRST116') throw ratingError;

      return !existingRating;
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
      return false;
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
