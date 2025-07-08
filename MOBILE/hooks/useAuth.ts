import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const { session, user, profile, setSession, setUser, setProfile } =
    useAuthStore();
  const { savePushToken } = useNotificationStore();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [checkedFirstVisit, setCheckedFirstVisit] = useState(false);

  // Check first visit
  useEffect(() => {
    const checkFirstVisit = async () => {
      const hasVisited = await AsyncStorage.getItem('hasVisitedBefore');
      if (!hasVisited) {
        router.replace('/welcome');
      }
      setCheckedFirstVisit(true);
    };
    checkFirstVisit();
  }, []);

  // Session and user loading
  useEffect(() => {
    if (!checkedFirstVisit) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setSessionLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkedFirstVisit]);

  // Profile loading
  useEffect(() => {
    if (!checkedFirstVisit) return;
    if (user?.id) {
      setProfileLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          }
          setProfileLoading(false);
        });
    } else {
      setProfileLoading(false);
    }
  }, [user, checkedFirstVisit]);

  // Handle push token when user authenticates
  useEffect(() => {
    const handlePushTokenOnAuth = async () => {
      if (user && session) {
        try {
          // Check if we have a stored push token
          const storedToken = await AsyncStorage.getItem('@agro_push_token');
          if (storedToken) {
            console.log('🔔 User authenticated, saving stored push token...');
            await savePushToken(storedToken);
          }
        } catch (error) {
          console.error('🔔 Error handling push token on auth:', error);
        }
      }
    };

    handlePushTokenOnAuth();
  }, [user, session, savePushToken]);

  const isLoading = sessionLoading || profileLoading;

  const isAuthenticated = !!session;
  const isVerified = profile?.verification_status === 'verified';
  const isDocsNotUploaded = profile?.docs_status === 'not_uploaded';
  const isDocsPending = profile?.docs_status === 'pending';
  const isDocsVerified = profile?.docs_status === 'accepted';

  useEffect(() => {
    if (!checkedFirstVisit || isLoading) return;
    // Wait for first visit check before redirecting
  }, [isLoading, checkedFirstVisit]);

  useEffect(() => {
    if (!checkedFirstVisit || isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!isVerified) {
      router.replace('/(auth)/verify-email');
    } else if (isDocsNotUploaded) {
      router.replace('/(auth)/upload-documents');
    } else if (isDocsPending) {
      router.replace('/(auth)/confirmation');
    }
  }, [
    isLoading,
    isAuthenticated,
    isDocsNotUploaded,
    isDocsPending,
    checkedFirstVisit,
  ]);

  return {
    isLoading,
    isAuthenticated,
    isVerified,
    isDocsNotUploaded,
    isDocsPending,
    isDocsVerified,
    session,
    user,
  };
}