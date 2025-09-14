import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  resetPassword: (newPassword: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateEmail: (email: string, password: string) => Promise<void>;
  fetchProfiles: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<Profile | null>;
  sendVerificationCodeToAuthenticatedUser: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<boolean>;
  updateEmailWithVerification: (
    newEmail: string,
    currentPassword: string,
    verificationCode: string
  ) => Promise<void>;
}

const SESSION_STORAGE_KEY = '@agro_session_data';

// Helper function to safely get environment variables
const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value;
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  return response.json().catch(() => ({}));
};

// Helper function to safely handle AsyncStorage operations
const safeAsyncStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to save to AsyncStorage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from AsyncStorage:', error);
    }
  },
};

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
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Sign in failed - no user returned');

      // Fetch profile data after successful sign in
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        // Don't throw here - user is authenticated, just no profile loaded
      }

      // Safe AsyncStorage operation
      await safeAsyncStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(data.session || {})
      );

      set({
        session: data.session,
        user: data.user,
        profile: profile || null,
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
    if (
      !email?.trim() ||
      !password?.trim() ||
      !profileData?.full_name?.trim()
    ) {
      set({ error: 'Email, password, and full name are required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
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
            specialization: profileData.specialization || null,
            other_specialization: profileData.other_specialization || null,
            verification_status: 'not_verified',
            docs_status: 'not_uploaded',
          },
        ])
        .select()
        .single();

      if (profileError || !profile) {
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.warn('Failed to cleanup auth user:', cleanupError);
        }
        throw profileError || new Error('Profile creation failed');
      }

      set({
        user: authData.user,
        profile,
      });

      // Send verification email with code
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/send-verification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              userId: authData.user.id,
              email: email.trim(),
              full_name: profileData.full_name,
            }),
          }
        );

        if (!response.ok) {
          console.warn(
            'Failed to send verification email:',
            await response.text()
          );
        }
      } catch (emailError) {
        console.warn('Verification email error:', emailError);
        // Don't throw here - user is created, just email failed
      }
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

      // Clear stored push token (don't throw on failure)
      await safeAsyncStorage.removeItem(SESSION_STORAGE_KEY);

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
      if (!session) {
        set({ session: null, user: null, profile: null });
        return;
      }

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

        if (profileError) {
          console.warn('Profile refresh error:', profileError);
        }

        set({
          session,
          user,
          profile: profile || null,
        });
      }
    } catch (error) {
      console.warn('Session refresh error:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to refresh session',
      });
    }
  },

  verifyEmail: async (code) => {
    if (!code?.trim()) {
      set({ error: 'Verification code is required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { user } = get();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase.rpc('verify_code', {
        user_id: user.id,
        input_code: code.trim(),
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
        .eq('code', code.trim());

      if (deleteError) {
        console.warn('Failed to delete verification code:', deleteError);
      }

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

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing environment configuration');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email || '',
            full_name: profile.full_name || 'User',
          }),
        }
      );

      await handleApiResponse(response);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to resend code',
      });
    } finally {
      set({ loading: false });
    }
  },

  sendVerificationCode: async (email: string): Promise<void> => {
    if (!email?.trim()) {
      set({ error: 'Email is required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      // Find the user by email in the auth.users table
      const { data, error } = await supabase.rpc('get_user_id_by_email', {
        email: email.trim(),
      });

      if (error || !data || !Array.isArray(data) || data.length === 0) {
        throw new Error('User not found');
      }

      const userId = data[0]?.id;
      if (!userId) {
        throw new Error('Invalid user data');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        throw new Error('Profile not found');
      }

      const supabaseUrl = getEnvVariable('EXPO_PUBLIC_SUPABASE_URL');
      const supabaseAnonKey = getEnvVariable('EXPO_PUBLIC_SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing environment configuration');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            userId: userId,
            email: email.trim(),
            fullName: profileData?.full_name || 'User',
          }),
        }
      );

      await handleApiResponse(response);
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

  sendVerificationCodeToAuthenticatedUser: async (): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('No user found');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        throw new Error('Profile not found');
      }

      const supabaseUrl = getEnvVariable('EXPO_PUBLIC_SUPABASE_URL');
      const supabaseAnonKey = getEnvVariable('EXPO_PUBLIC_SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing environment configuration');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email || '',
            fullName: profileData?.full_name || 'User',
          }),
        }
      );

      await handleApiResponse(response);
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
    if (!profile?.role) return false;

    // Map roles to permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      entrepreneur: [
        'create.job',
        'manage.workers',
        'view.applications',
        'manage.profile',
      ],
      advisor: [
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
    if (!Array.isArray(permissions)) return false;
    return permissions.some((permission) => get().hasPermission(permission));
  },

  hasAllPermissions: (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every((permission) => get().hasPermission(permission));
  },

  canCreateJob: (targetRole) => {
    const { profile } = get();
    if (!profile?.role) return false;

    const validRoles = ['admin', 'entrepreneur', 'advisor', 'worker'];
    if (!validRoles.includes(targetRole)) return false;

    switch (profile.role) {
      case 'admin':
        return true;
      case 'entrepreneur':
        return ['advisor', 'worker'].includes(targetRole);
      case 'advisor':
        return ['worker'].includes(targetRole);
      default:
        return false;
    }
  },

  resetPassword: async (
    newPassword: string,
    password: string
  ): Promise<void> => {
    if (!newPassword?.trim() || !password?.trim()) {
      set({ error: 'Current password and new password are required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { session } = get();
      if (!session?.user?.email) {
        throw new Error(
          'Auth session missing. Please use the password recovery link.'
        );
      }

      // First verify password by signing in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password,
      });

      if (authError) {
        throw new Error('Mot de passe incorrect');
      }

      // Reset the password
      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });

      if (resetError) throw resetError;

      // Sign out after password reset
      await get().signOut();
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
    if (!email?.trim()) {
      set({ error: 'Email is required' });
      return;
    }
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
      set({ profiles: data || [] });
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
        .eq('id', user.id)
        .single();

      if (error) throw error;
      set({ profile: data || null });
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
    if (!profileData || Object.keys(profileData).length === 0) {
      set({ error: 'No profile data provided' });
      return null;
    }

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

  verifyEmailCode: async (code: string): Promise<boolean> => {
    if (!code?.trim()) {
      set({ error: 'Verification code is required' });
      return false;
    }

    set({ loading: true, error: null });
    try {
      const { user } = get();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase.rpc('verify_code', {
        user_id: user.id,
        input_code: code.trim(),
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
        .eq('code', code.trim());

      if (deleteError) {
        console.warn('Failed to delete verification code:', deleteError);
      }

      set({ profile });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to verify code',
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateEmailWithVerification: async (
    newEmail: string,
    currentPassword: string,
    verificationCode: string
  ): Promise<void> => {
    if (
      !newEmail?.trim() ||
      !currentPassword?.trim() ||
      !verificationCode?.trim()
    ) {
      set({ error: 'All fields are required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { session } = get();

      if (!session?.user?.email) {
        throw new Error('Session utilisateur introuvable');
      }

      // First verify the current password by signing in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (authError) {
        throw new Error('Mot de passe incorrect');
      }

      // Verify the email verification code
      const isCodeValid = await get().verifyEmailCode(verificationCode);
      if (!isCodeValid) {
        throw new Error('Code de vérification incorrect');
      }

      // If both password and code are correct, update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (updateError) throw updateError;

      // Update local session state
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();
      if (newSession) {
        set({ session: newSession, user: newSession.user });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Échec de la mise à jour de l'email",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateEmail: async (newEmail: string, password: string): Promise<void> => {
    if (!newEmail?.trim() || !password?.trim()) {
      set({ error: 'Email and password are required' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { session } = get();

      if (!session?.user?.email) {
        throw new Error('Session utilisateur introuvable');
      }

      // First verify password by signing in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password,
      });

      if (authError) {
        throw new Error('Mot de passe incorrect');
      }

      // If password is correct, update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (updateError) throw updateError;

      // Update local session state
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();
      if (newSession) {
        set({ session: newSession, user: newSession.user });
      }
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
