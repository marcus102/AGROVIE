import { create } from 'zustand';
import { Mission, MissionStatus } from '@/types/mission';
import { supabase } from '@/lib/supabase';

interface MissionState {
  missions: Mission[];
  draftMission: Partial<Mission> | null;
  loading: boolean;
  error: string | null;
  setMissions: (missions: Mission[]) => void;
  setDraftMission: (mission: Partial<Mission> | null) => void;
  updateDraftMission: (updates: Partial<Mission>) => void;
  fetchMissions: () => Promise<void>;
  fetchMissionByID: (id: string) => Promise<Mission | null>;
  fetchMissionByIDWithImages: (id: string) => Promise<Mission | null>;
  fetchMissionByUserId: (
    userId: string
  ) => Promise<{ data: Mission[] | null; error: any }>;
  createMission: (mission: Partial<Mission>) => Promise<Mission | null>;
  updateMission: (
    id: string,
    updates: Partial<Mission>
  ) => Promise<Mission | null>;
  deleteMission: (id: string) => Promise<void>;
  publishMission: (mission: Mission) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  draftMission: null,
  loading: false,
  error: null,
  setMissions: (missions) => set({ missions: missions || [] }),
  setDraftMission: (mission) => set({ draftMission: mission }),
  updateDraftMission: (updates) =>
    set((state) => ({
      draftMission: state.draftMission
        ? { ...state.draftMission, ...updates }
        : updates,
    })),

  fetchMissions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ missions: (data as Mission[]) || [] });
    } catch (error) {
      console.error('Error fetching missions:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch missions',
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchMissionByID: async (id: string): Promise<Mission | null> => {
    if (!id || typeof id !== 'string') {
      set({ error: 'Invalid mission ID provided' });
      return null;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching mission by ID:', error);
        set({ error: error.message });
        return null;
      }
      
      if (!data) {
        set({ error: 'Mission not found' });
        return null;
      }
      
      return data as Mission;
    } catch (error) {
      console.error('Unexpected error fetching mission:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch mission';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchMissionByIDWithImages: async (id: string): Promise<Mission | null> => {
    if (!id || typeof id !== 'string') {
      set({ error: 'Invalid mission ID provided' });
      return null;
    }

    set({ loading: true, error: null });
    try {
      // Fetch the mission by ID
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching mission with images:', error);
        set({ error: error.message });
        return null;
      }

      if (!data) {
        set({ error: 'Mission not found' });
        return null;
      }

      // Process mission_images to generate signed URLs
      const mission = data as Mission;
      const images = mission.mission_images && Array.isArray(mission.mission_images)
        ? await Promise.all(
            mission.mission_images
              .filter(image => image && typeof image === 'string')
              .map(async (image: string) => {
                try {
                  const signedUrl = await generateSignedToken(image);
                  if (!signedUrl) {
                    console.warn(`File not found: ${image}`);
                  }
                  return signedUrl || '';
                } catch (error) {
                  console.error(`Error generating signed URL for ${image}:`, error);
                  return '';
                }
              })
          )
        : [];

      // Return the mission with processed images
      const missionWithImages = { ...mission, mission_images: images.filter(Boolean) };
      return missionWithImages;
    } catch (error) {
      console.error('Unexpected error fetching mission with images:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch mission';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchMissionByUserId: async (
    userId: string
  ): Promise<{ data: Mission[] | null; error: any }> => {
    if (!userId || typeof userId !== 'string') {
      const error = 'Invalid user ID provided';
      set({ error });
      return { data: null, error };
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching missions by user ID:', error);
        set({ error: error.message });
        return { data: null, error };
      }

      if (!data || !Array.isArray(data)) {
        set({ missions: [] });
        return { data: [], error: null };
      }

      // Process mission_images to ensure valid URLs
      const processedData = await Promise.all(
        (data as Mission[]).map(async (mission) => {
          const images = mission.mission_images && Array.isArray(mission.mission_images)
            ? await Promise.all(
                mission.mission_images
                  .filter(image => image && typeof image === 'string')
                  .map(async (image: string) => {
                    try {
                      const signedUrl = await generateSignedToken(image);
                      return signedUrl || '';
                    } catch (error) {
                      console.error(`Error generating signed URL for ${image}:`, error);
                      return '';
                    }
                  })
              )
            : [];
          
          return { ...mission, mission_images: images.filter(Boolean) };
        })
      );

      set({ missions: processedData });
      return { data: processedData, error: null };
    } catch (error) {
      console.error('Unexpected error fetching missions by user ID:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch missions';
      set({ error: errorMessage });
      return { data: null, error };
    } finally {
      set({ loading: false });
    }
  },

  createMission: async (mission: Partial<Mission>): Promise<Mission | null> => {
    if (!mission || typeof mission !== 'object') {
      set({ error: 'Invalid mission data provided' });
      return null;
    }

    set({ loading: true, error: null });
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('missions')
        .insert([
          {
            ...mission,
            user_id: userData.user.id,
            status: 'in_review' as MissionStatus,
            original_price: mission.original_price || 0,
            adjustment_price: mission.adjustment_price || 0,
            final_price: mission.final_price || 0,
            applicants: mission.applicants || [],
            personalized_expression: mission.personalized_expression || '',
          },
        ])
        .select('*');

      console.log('createMission data:', data, 'error:', error);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const newMission = data[0] as Mission;
        set((state) => ({ missions: [newMission, ...state.missions] }));
        return newMission;
      }
      
      throw new Error('No data returned from mission creation');
    } catch (error) {
      console.error('Error creating mission:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create mission',
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateMission: async (id, updates) => {
    if (!id || typeof id !== 'string') {
      set({ error: 'Invalid mission ID provided' });
      return null;
    }

    if (!updates || typeof updates !== 'object') {
      set({ error: 'Invalid update data provided' });
      return null;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', id)
        .select('*');

      if (error) throw error;
      
      if (data && data.length > 0) {
        const updatedMission = data[0] as Mission;
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === id ? updatedMission : mission
          ),
        }));
        return updatedMission;
      }
      
      throw new Error('No data returned from mission update');
    } catch (error) {
      console.error('Error updating mission:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update mission',
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteMission: async (id) => {
    if (!id || typeof id !== 'string') {
      set({ error: 'Invalid mission ID provided' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('missions').delete().eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        missions: state.missions.filter((mission) => mission.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting mission:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete mission',
      });
    } finally {
      set({ loading: false });
    }
  },

  publishMission: async (mission) => {
    if (!mission || !mission.id) {
      set({ error: 'Invalid mission data provided' });
      return;
    }

    set({ loading: true, error: null });
    try {
      // Note: This seems to be updating 'jobs' table but the store is for 'missions'
      // Consider if this should be 'missions' table instead
      const { data, error } = await supabase
        .from('missions') // Changed from 'jobs' to 'missions' for consistency
        .update({
          status: 'online',
          published_at: new Date().toISOString(),
        })
        .eq('id', mission.id)
        .select('*');

      if (error) throw error;
      
      if (data && data.length > 0) {
        const publishedMission = data[0] as Mission;
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === mission.id ? publishedMission : m
          ),
          draftMission: null,
        }));
      }
    } catch (error) {
      console.error('Error publishing mission:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to publish mission',
      });
    } finally {
      set({ loading: false });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

async function generateSignedToken(filePath: string): Promise<string | null> {
  if (!filePath || typeof filePath !== 'string') {
    console.error('Invalid file path provided to generateSignedToken');
    return null;
  }

  try {
    // Reduced expiration time to a reasonable value (1 hour)
    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUrl(filePath, 60 * 60); // 1 hour in seconds

    if (error) {
      console.error('Error generating signed URL:', error.message);
      return null;
    }

    const signedURL = data?.signedUrl;
    return signedURL ?? null;
  } catch (error) {
    console.error('Unexpected error generating signed URL:', error);
    return null;
  }
}