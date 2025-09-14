import { create } from 'zustand';
import { supabase } from '@/lib/supabase'; // Adjust import path as needed
import { DynamicLink } from '@/types/dynamic_links'; // Adjust import path for LinkItem

interface LinkStoreState {
  links: DynamicLink[];
  loading: boolean;
  error: string | null;
}

interface LinkStoreActions {
  fetchLinks: () => Promise<void>;
  setLinks: (links: DynamicLink[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type LinkStore = LinkStoreState & LinkStoreActions;

export const useLinkStore = create<LinkStore>((set) => ({
  links: [],
  loading: false,
  error: null,

  fetchLinks: async () => {
    set({ loading: true, error: null });
    try {
      const { data: links, error } = await supabase
        .from('Links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ links: links || [] });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch links',
      });
    } finally {
      set({ loading: false });
    }
  },

  setLinks: (links: DynamicLink[]) => set({ links }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));