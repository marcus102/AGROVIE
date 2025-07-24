import { useEffect, useState, useCallback, useRef } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useThemeStore } from '@/stores/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  SESSION: '@agro_session_data',
  PUSH_TOKEN: '@agro_push_token',
  FIRST_VISIT: '@agro_has_visited',
} as const;

// Token validation constants
const TOKEN_BUFFER_TIME = 5 * 60 * 1000; // 5 minutes

// Types for better type safety
interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface InitializationState {
  isInitializing: boolean;
  hasCheckedFirstVisit: boolean;
  hasValidatedToken: boolean;
  hasInitializedTheme: boolean;
  hasLoadedProfile: boolean;
}

// Utility functions
const isTokenValid = (session: SessionData | null): boolean => {
  if (
    !session?.access_token ||
    !session?.refresh_token ||
    !session?.expires_at
  ) {
    return false;
  }

  const expiresAt = session.expires_at * 1000;
  const now = Date.now();

  return expiresAt > now + TOKEN_BUFFER_TIME;
};

const clearStoredSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (error) {
    console.error('🔐 Error clearing stored session:', error);
  }
};

const getStoredSession = async (): Promise<SessionData | null> => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('🔐 Error reading stored session:', error);
    await clearStoredSession();
    return null;
  }
};

const storeSession = async (session: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('🔐 Error storing session:', error);
  }
};

export function useAuth() {
  const { session, user, profile, setSession, setUser, setProfile } =
    useAuthStore();
  const { savePushToken } = useNotificationStore();
  const { initializeTheme } = useThemeStore();

  // Simplified state management
  const [initState, setInitState] = useState<InitializationState>({
    isInitializing: true,
    hasCheckedFirstVisit: false,
    hasValidatedToken: false,
    hasInitializedTheme: false,
    hasLoadedProfile: false,
  });

  const [tokenAuthenticated, setTokenAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Refs for cleanup and preventing race conditions
  const isMountedRef = useRef(true);
  const authSubscriptionRef = useRef<any>(null);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      authSubscriptionRef.current?.unsubscribe();
    };
  }, []);

  // Safe state updater
  const safeSetState = useCallback(
    <T>(setter: (prev: T) => T, currentState: T): void => {
      if (isMountedRef.current) {
        setter(currentState);
      }
    },
    []
  );

  // Initialize theme (can run in parallel with auth)
  const initializeThemeAsync = useCallback(async (): Promise<void> => {
    try {
      await initializeTheme();
    } catch (error) {
      console.error('🎨 Error initializing theme:', error);
      // Don't throw - theme failure shouldn't block auth
    } finally {
      if (isMountedRef.current) {
        setInitState((prev) => ({ ...prev, hasInitializedTheme: true }));
      }
    }
  }, [initializeTheme]);

  // Check if this is first visit
  const checkFirstVisit = useCallback(async (): Promise<boolean> => {
    try {
      const hasVisited = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_VISIT);

      if (isMountedRef.current) {
        setInitState((prev) => ({ ...prev, hasCheckedFirstVisit: true }));
      }

      if (!hasVisited) {
        router.replace('/welcome');
        return false;
      }

      return true;
    } catch (error) {
      console.error('🔐 Error checking first visit:', error);
      if (isMountedRef.current) {
        setInitState((prev) => ({ ...prev, hasCheckedFirstVisit: true }));
      }
      return true; // Continue on error
    }
  }, []);

  // Validate stored token and authenticate
  const validateStoredToken = useCallback(async (): Promise<boolean> => {
    try {
      const storedSession = await getStoredSession();

      if (!storedSession || !isTokenValid(storedSession)) {
        if (storedSession) {
          console.log('🔐 Stored token is expired or invalid');
          await clearStoredSession();
        }
        return false;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: storedSession.access_token,
        refresh_token: storedSession.refresh_token,
      });

      if (error || !data.session) {
        console.log('🔐 Stored token authentication failed:', error?.message);
        await clearStoredSession();
        return false;
      }

      if (isMountedRef.current) {
        setSession(data.session);
        setUser(data.session.user);
        setTokenAuthenticated(true);
      }

      console.log('🔐 User authenticated from stored token');
      return true;
    } catch (error) {
      console.error('🔐 Error validating stored token:', error);
      await clearStoredSession();
      return false;
    }
  }, [setSession, setUser]);

  // Get current session if no stored token worked
  const getCurrentSession = useCallback(async (): Promise<void> => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (isMountedRef.current) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    } catch (error) {
      console.error('🔐 Error getting current session:', error);
      if (isMountedRef.current) {
        setAuthError('Failed to get current session');
      }
    }
  }, [setSession, setUser]);

  // Setup auth state listener
  const setupAuthListener = useCallback((): void => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMountedRef.current) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Handle session storage
      if (newSession) {
        await storeSession(newSession);
      } else {
        await clearStoredSession();
        setTokenAuthenticated(false);
      }

      // Clear any auth errors on successful auth
      if (newSession && authError) {
        setAuthError(null);
      }
    });

    authSubscriptionRef.current = subscription;
  }, [setSession, setUser, authError]);

  // Load user profile
  const loadUserProfile = useCallback(
    async (userId: string): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (isMountedRef.current) {
          if (!error && data) {
            setProfile(data);
          } else if (error) {
            console.error('👤 Error loading profile:', error);
            setAuthError('Failed to load user profile');
          }
        }
      } catch (error) {
        console.error('👤 Error loading profile:', error);
        if (isMountedRef.current) {
          setAuthError('Failed to load user profile');
        }
      }
    },
    [setProfile]
  );

  // Handle push token on authentication
  const handlePushTokenOnAuth = useCallback(async (): Promise<void> => {
    if (!user || !session) return;

    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
      if (storedToken) {
        console.log('🔔 User authenticated, saving stored push token...');
        await savePushToken(storedToken);
      }
    } catch (error) {
      console.error('🔔 Error handling push token on auth:', error);
    }
  }, [user, session, savePushToken]);

  // Main initialization function
  const initializeAuth = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous initializations
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }

    const initPromise = (async () => {
      try {
        // Step 1: Check first visit (blocking)
        const canProceed = await checkFirstVisit();
        if (!canProceed) return;

        // Step 2: Validate stored token
        const tokenAuthSuccess = await validateStoredToken();

        if (isMountedRef.current) {
          setInitState((prev) => ({ ...prev, hasValidatedToken: true }));
        }

        // Step 3: Get current session if token auth failed
        if (!tokenAuthSuccess) {
          await getCurrentSession();
        }

        // Step 4: Setup auth listener
        setupAuthListener();
      } catch (error) {
        console.error('🔐 Auth initialization error:', error);
        if (isMountedRef.current) {
          setAuthError('Authentication initialization failed');
          setInitState((prev) => ({
            ...prev,
            hasCheckedFirstVisit: true,
            hasValidatedToken: true,
          }));
        }
      }
    })();

    initializationPromiseRef.current = initPromise;
    await initPromise;
    initializationPromiseRef.current = null;
  }, [
    checkFirstVisit,
    validateStoredToken,
    getCurrentSession,
    setupAuthListener,
  ]);

  // Initialize everything on mount
  useEffect(() => {
    const init = async () => {
      // Run theme initialization in parallel with auth
      const themePromise = initializeThemeAsync();
      const authPromise = initializeAuth();

      await Promise.all([themePromise, authPromise]);

      if (isMountedRef.current) {
        setInitState((prev) => ({ ...prev, isInitializing: false }));
      }
    };

    init();
  }, [initializeThemeAsync, initializeAuth]);

  // Load profile when user becomes available
  useEffect(() => {
    if (!initState.hasValidatedToken || !initState.hasCheckedFirstVisit) return;

    const loadProfile = async () => {
      if (user?.id) {
        await loadUserProfile(user.id);
      }

      if (isMountedRef.current) {
        setInitState((prev) => ({ ...prev, hasLoadedProfile: true }));
      }
    };

    loadProfile();
  }, [
    user?.id,
    initState.hasValidatedToken,
    initState.hasCheckedFirstVisit,
    loadUserProfile,
  ]);

  // Handle push token when user authenticates
  useEffect(() => {
    handlePushTokenOnAuth();
  }, [handlePushTokenOnAuth]);

  // Navigation logic - simplified and more reliable
  useEffect(() => {
    const {
      isInitializing,
      hasCheckedFirstVisit,
      hasValidatedToken,
      hasInitializedTheme,
      hasLoadedProfile,
    } = initState;

    // Wait for all initialization to complete
    if (
      isInitializing ||
      !hasCheckedFirstVisit ||
      !hasValidatedToken ||
      !hasInitializedTheme ||
      !hasLoadedProfile
    ) {
      return;
    }

    const isAuthenticated = !!session;
    const isVerified = profile?.verification_status === 'verified';
    const isDocsNotUploaded = profile?.docs_status === 'not_uploaded';
    const isDocsPending = profile?.docs_status === 'pending';

    // Navigation logic with priority order
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!isVerified) {
      router.replace('/(auth)/verify-email');
    } else if (isDocsNotUploaded) {
      router.replace('/(auth)/upload-documents');
    } else if (isDocsPending) {
      router.replace('/(auth)/confirmation');
    }
    // If all checks pass, user stays on current route (likely app home)
  }, [initState, session, profile]);

  // Computed loading state
  const isLoading =
    initState.isInitializing ||
    !initState.hasCheckedFirstVisit ||
    !initState.hasValidatedToken ||
    !initState.hasInitializedTheme ||
    !initState.hasLoadedProfile;

  // Computed authentication states
  const isAuthenticated = !!session;
  const isVerified = profile?.verification_status === 'verified';
  const isDocsNotUploaded = profile?.docs_status === 'not_uploaded';
  const isDocsPending = profile?.docs_status === 'pending';
  const isDocsVerified = profile?.docs_status === 'accepted';

  return {
    // Loading states
    isLoading,
    authError,

    // Authentication states
    isAuthenticated,
    isVerified,
    isDocsNotUploaded,
    isDocsPending,
    isDocsVerified,
    tokenAuthenticated,

    // Data
    session,
    user,
    profile,
  };
}
