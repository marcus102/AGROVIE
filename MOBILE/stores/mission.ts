import { create } from 'zustand';
import { Mission, MissionStatus } from '@/types/mission';
import { supabase } from '@/lib/supabase';

interface MissionState {
  missions: Mission[];
  draftMission: Partial<Mission> | null;
  loading: boolean;
  error: string | null;
  setMissions: (missions: Mission[]) => void;
  setDraftMission: (missions: Partial<Mission> | null) => void;
  updateDraftMission: (updates: Partial<Mission>) => void;
  fetchMissions: () => Promise<void>;
  fetchMissionByID: (id: string) => Promise<Mission | null>;
  fetchMissionByIDWithImages: (id: string) => Promise<Mission | null>;
  fetchMissionByUserId: (userId: string) => Promise<{ data: Mission[] | null; error: any }>;
  createMission: (missions: Partial<Mission>) => Promise<Mission | null>;
  updateMission: (id: string, updates: Partial<Mission>) => Promise<Mission | null>;
  deleteMission: (id: string) => Promise<void>;
  publishMission: (missions: Mission) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  draftMission: null,
  loading: false,
  error: null,
  setMissions: (missions) => set({ missions: missions }),
  setDraftMission: (mission) => set({ draftMission: mission }),
  updateDraftMission: (updates) =>
    set((state) => ({
      draftMission: state.draftMission ? { ...state.draftMission, ...updates } : updates,
    })),

  fetchMissions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ missions: data as Mission[] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch missions',
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchMissionByID: async (id: string): Promise<Mission | null> => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        set({ error: error.message });
        return null;
      }
      return data as Mission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch mission';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchMissionByIDWithImages: async (id: string): Promise<Mission | null> => {
    set({ loading: true, error: null });
    try {
      // Fetch the mission by ID
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message });
        return null;
      }

      if (!data) {
        set({ error: 'Mission not found' });
        return null;
      }

      // Process mission_images to generate signed URLs
      const mission = data as Mission;
      const images = mission.mission_images
        ? await Promise.all(
            mission.mission_images.map(async (image: string) => {
              const signedUrl = await generateSignedToken(`${image}`);
              if (!signedUrl) {
                console.warn(`File not found: ${image}`);
              }
              return signedUrl || '';
            })
          )
        : [];

      // Return the mission with processed images
      const missionWithImages = { ...mission, mission_images: images };
      return missionWithImages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch mission';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchMissionByUserId: async (userId: string): Promise<{ data: Mission[] | null; error: any }> => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        set({ error: error.message });
        return { data: null, error };
      }

      // Process mission_images to ensure valid URLs
      const processedData = await Promise.all(
        (data as Mission[]).map(async (mission) => {
          const images = mission.mission_images
            ? await Promise.all(
                mission.mission_images.map(async (image: string) => {
                  const signedUrl = await generateSignedToken(`${image}`);
                  return signedUrl || '';
                })
              )
            : [];
          return { ...mission, mission_images: images };
        })
      );

      set({ missions: processedData });
      return { data: processedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch missions';
      set({ error: errorMessage });
      return { data: null, error };
    } finally {
      set({ loading: false });
    }
  },

  createMission: async (mission: Partial<Mission>): Promise<Mission | null> => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .insert([
          {
            ...mission,
            user_id: (await supabase.auth.getUser()).data?.user?.id,
            status: 'in_review' as MissionStatus,
            original_price: mission.original_price,
            adjustment_price: mission.adjustment_price,
            final_price: mission.final_price,
            applicants: [],
          },
        ])
        .select('*');

        console.log('createMission data:', data, 'error:', error);

      if (error) throw error;
      if (data) {
        set((state) => ({ missions: [data[0] as Mission, ...state.missions] }));
        return data[0] as Mission;
      }
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create mission',
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateMission: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', id)
        .select('*');

      if (error) throw error;
      if (data) {
        set((state) => ({
          missions: state.missions.map((j) => (j.id === id ? (data[0] as Mission) : j)),
        }));
        return data[0] as Mission;
      }
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update mission',
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteMission: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('missions').delete().eq('id', id);

      if (error) throw error;
      set((state) => ({
        missions: state.missions.filter((j) => j.id !== id),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete mission',
      });
    } finally {
      set({ loading: false });
    }
  },

  publishMission: async (mission) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', mission.id)
        .select('*');

      if (error) throw error;
      if (data) {
        set((state) => ({
          missions: state.missions.map((j) => (j.id === mission.id ? (data[0] as Mission) : j)),
          draftMission: null,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to publish job',
      });
    } finally {
      set({ loading: false });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

async function generateSignedToken(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUrl(filePath, 60 * 60 * 1000000000000000);

    const signedURL = data?.signedUrl;

    if (error) {
      console.error('Error generating signed URL:', error.message);
      return null;
    }

    return signedURL ?? null;
  } catch (error) {
    console.error('Unexpected error generating signed URL:', error);
    return null;
  }
}
