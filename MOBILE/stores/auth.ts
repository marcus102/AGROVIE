import { updateProfile } from './../lib/supabase';
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profiles: Profile[];
  loading: boolean;
  error: string | null;

  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;

  verifyEmail: (code: string) => Promise<void>;
  resendVerificationCode: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;

  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canCreateJob: (targetRole: string) => boolean;

  resetPassword: (newPassword: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateEmail: (email: string, password: string) => Promise<void>;
  fetchProfiles: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<Profile | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  profiles: [],
  loading: false,
  error: null,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Fetch profile data after successful sign in
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      set({
        session: data.session,
        user: data.user,
        profile,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to sign in',
      });
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, profileData) => {
    set({ loading: true, error: null });
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Then create the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: profileData.full_name,
            role: profileData.role,
            phone: profileData.phone || null,
            verification_status: 'not_verified',
            docs_status: 'not_uploaded',
          },
        ])
        .select()
        .single();

      if (profileError || !profile) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Send verification email with code
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: authData.user.id,
            email: email,
            fullName: profileData.full_name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      set({
        user: authData.user,
        profile,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to sign up',
      });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all auth state
      set({
        session: null,
        user: null,
        profile: null,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to sign out',
      });
    } finally {
      set({ loading: false });
    }
  },

  refreshSession: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const {
        data: { user },
        error: refreshError,
      } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      // Also refresh profile data
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        set({
          session,
          user,
          profile,
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to refresh session',
      });
    }
  },

  verifyEmail: async (code) => {
    set({ loading: true, error: null });
    try {
      const { user } = get();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase.rpc('verify_code', {
        user_id: user.id,
        input_code: code,
      });

      if (error) throw error;
      if (!data) throw new Error('Invalid verification code');

      // Update profile verification status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Delete the used verification code
      const { error: deleteError } = await supabase
        .from('verification_codes')
        .delete()
        .eq('code', code);

      if (deleteError) throw deleteError;

      set({ profile });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to verify email',
      });
    } finally {
      set({ loading: false });
    }
  },

  resendVerificationCode: async () => {
    set({ loading: true, error: null });
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('No user found');

      // Call the edge function to resend verification code
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            fullName: profile.full_name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to resend verification code');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to resend code',
      });
    } finally {
      set({ loading: false });
    }
  },

  sendVerificationCode: async (email: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      // Find the user by email in the auth.users table
      const { data, error } = await supabase.rpc('get_user_id_by_email', {
        email,
      });

      if (error) {
        throw new Error('User not found');
      }

      const userId = data[0].id;
      console.log('The user ID', userId);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error(
          'Error fetching profile data:',
          profileError,
          'Profile data:',
          profileData
        );
        throw new Error('Profile not found');
      }
      console.log('The profile data', profileData);

      // Send verification email with code
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: userId,
            email: email,
            fullName: profileData?.full_name || 'User',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send verification code',
      });
    } finally {
      set({ loading: false });
    }
  },

  hasPermission: (permission) => {
    const { profile } = get();
    if (!profile) return false;

    // Map roles to permissions
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      entrepreneur: [
        'create.job',
        'manage.workers',
        'view.applications',
        'manage.profile',
      ],
      technician: [
        'create.job.worker',
        'view.jobs',
        'apply.jobs',
        'manage.profile',
      ],
      worker: ['view.jobs', 'apply.jobs', 'manage.profile'],
    };

    const userPermissions = rolePermissions[profile.role];
    return (
      userPermissions?.includes('*') ||
      userPermissions?.includes(permission) ||
      false
    );
  },

  hasAnyPermission: (permissions) => {
    return permissions.some((permission) => get().hasPermission(permission));
  },

  hasAllPermissions: (permissions) => {
    return permissions.every((permission) => get().hasPermission(permission));
  },

  canCreateJob: (targetRole) => {
    const { profile } = get();
    if (!profile) return false;

    switch (profile.role) {
      case 'admin':
        return true;
      case 'entrepreneur':
        return ['technician', 'worker'].includes(targetRole);
      case 'technician':
        return ['worker'].includes(targetRole);
      default:
        return false;
    }
  },

  resetPassword: async (newPassword: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      // Check if a session exists
      const { session } = get();
      if (!session) {
        throw new Error(
          'Auth session missing. Please use the password recovery link.'
        );
      }

      // Reset the password
      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (resetError) throw resetError;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to reset password',
      });
    } finally {
      set({ loading: false });
    }
  },

  sendPasswordResetEmail: async (email: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send password reset email',
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      set({ profiles: data });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch profiles',
      });
    } finally {
      set({ loading: false });
    }
  },
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not found');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id || '')
        .single();
      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch profile',
      });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (
    profileData: Partial<Profile>
  ): Promise<Profile | null> => {
    set({ loading: true, error: null });
    try {
      const { profile } = get();
      if (!profile) throw new Error('No profile found');

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: data });
      return data;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update profile',
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  updateEmail: async (newEmail: string, password: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const { session } = get();

      if (!session?.user?.email) {
        throw new Error('Session utilisateur introuvable');
      }

      // First verify password by signing in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: password,
      });

      if (authError) {
        throw new Error('Mot de passe incorrect');
      }

      // If password is correct, update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) throw updateError;

      // Send email confirmation
      const { error: confirmError } = await supabase.auth.resend({
        type: 'email_change',
        email: newEmail,
      });

      if (confirmError) throw confirmError;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Échec de la mise à jour de l'email",
      });
    } finally {
      set({ loading: false });
    }
  },
}));
