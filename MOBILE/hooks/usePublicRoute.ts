import { useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuth } from './useAuth';

export function usePublicRoute() {
  const { isAuthenticated, isVerified, isLoading, isDocsVerified } = useAuth();

  const handleNavigation = useCallback(() => {
    if (!isLoading && isAuthenticated && isVerified && isDocsVerified) {
      router.replace('/');
    }
  }, [isAuthenticated, isVerified, isLoading]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);
}
