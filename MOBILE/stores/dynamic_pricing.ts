import { create } from 'zustand';
import { DynamicPricing } from '@/types/dynamic_pricing';
import { supabase } from '@/lib/supabase';

interface DynamicPricingStoreState {
  dynamicPricing: DynamicPricing[];
  draftPricing: DynamicPricing | null;
  loadingPricing: boolean;
  errorPricing: string | null;
}

interface DynamicPricingStoreActions {
  setPricings: (pricings: DynamicPricing[]) => void;
  setDraftPricing: (pricing: DynamicPricing | null) => void;
  fetchPricings: (
    filters?: Partial<{
      actor_rank: DynamicPricing['actor_rank'];
      actor_specialization2: string;
      experience_level: DynamicPricing['experience_level'];
      surface_unit2: DynamicPricing['surface_unit2'];
    }>
  ) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type DynamicPricingStore = DynamicPricingStoreState &
  DynamicPricingStoreActions;

export const useDynamicPricingStore = create<DynamicPricingStore>(
  (set, get) => ({
    dynamicPricing: [],
    draftPricing: null,
    loadingPricing: false,
    errorPricing: null,

    setPricings: (dynamicPricing: DynamicPricing[]) => set({ dynamicPricing }),
    setDraftPricing: (pricing: DynamicPricing | null) =>
      set({ draftPricing: pricing }),
    fetchPricings: async (filters) => {
      set({ loadingPricing: true, errorPricing: null });
      try {
        let query = supabase.from('dynamic_pricing').select('*');

        // Apply filters if provided
        if (filters) {
          if (filters.actor_rank)
            query = query.eq('actor_rank', filters.actor_rank);
          if (filters.actor_specialization2)
            query = query.eq(
              'actor_specialization2',
              filters.actor_specialization2
            );
          if (filters.experience_level)
            query = query.eq('experience_level', filters.experience_level);
          if (filters.surface_unit2)
            query = query.eq('surface_unit2', filters.surface_unit2);
        }

        // Always order by creation date
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        set({ dynamicPricing: data || [] });
      } catch (error) {
        set({
          errorPricing:
            error instanceof Error
              ? error.message
              : 'Failed to fetch pricing data',
        });
      } finally {
        set({ loadingPricing: false });
      }
    },

    setLoading: (loading: boolean) => set({ loadingPricing: loading }),
    setError: (error: string | null) => set({ errorPricing: error }),
  })
);
