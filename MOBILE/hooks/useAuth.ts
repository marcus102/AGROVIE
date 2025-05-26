import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const { session, user, profile, setSession, setUser, setProfile } = useAuthStore();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Session and user loading
  useEffect(() => {
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
  }, []);

  // Profile loading
  useEffect(() => {
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
  }, [user]);

  const isLoading = sessionLoading || profileLoading;

  const isAuthenticated = !!session;
  const isVerified = profile?.verification_status === 'verified';
  const isDocsNotUploaded = profile?.docs_status === 'not_uploaded';
  const isDocsPending = profile?.docs_status === 'pending';
  const isDocsVerified = profile?.docs_status === 'accepted';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (!isVerified) {
        router.replace('/(auth)/verify-email');
      } else if (isDocsNotUploaded) {
        router.replace('/(auth)/upload-documents');
      } else if (isDocsPending) {
        router.replace('/(auth)/confirmation');
      }
    }
  }, [isLoading, isAuthenticated, isDocsNotUploaded, isDocsPending]);

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
