import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/auth';

const STORAGE_KEYS = {
  WELCOME_SHOWN: '@agro_welcome_shown',
  FEEDBACK_REMINDER: '@agro_feedback_reminder',
} as const;

const FEEDBACK_DELAY_DAYS = 3;

interface WelcomeFlowState {
  showWelcome: boolean;
  showFeedback: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWelcomeFlow() {
  const [state, setState] = useState<WelcomeFlowState>({
    showWelcome: false,
    showFeedback: false,
    isLoading: true,
    error: null,
  });

  const { user, profile } = useAuthStore();
  const isInitialized = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // Memoized date calculation for better performance
  const getFeedbackThresholdDate = useCallback(() => {
    const date = new Date();
    date.setDate(date.getDate() - FEEDBACK_DELAY_DAYS);
    return date;
  }, []);

  // Optimized storage operations with better error handling
  const getStorageValue = useCallback(
    async (key: string): Promise<string | null> => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.warn(`Failed to read ${key}:`, error);
        return null;
      }
    },
    []
  );

  const setStorageValue = useCallback(
    async (key: string, value: string): Promise<boolean> => {
      try {
        await AsyncStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error(`Failed to write ${key}:`, error);
        return false;
      }
    },
    []
  );

  // Main logic with improved error handling and performance
  const checkWelcomeStatus = useCallback(async () => {
    if (!user || !profile) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Cancel previous request if still pending
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Batch storage reads for better performance
      const [welcomeShown, feedbackReminder] = await Promise.all([
        getStorageValue(STORAGE_KEYS.WELCOME_SHOWN),
        getStorageValue(STORAGE_KEYS.FEEDBACK_REMINDER),
      ]);

      // Check if operation was aborted
      if (abortController.current?.signal.aborted) return;

      let showWelcome = false;
      let showFeedback = false;

      // Show welcome for new users
      if (!welcomeShown) {
        showWelcome = true;
      } else if (!feedbackReminder) {
        // Check if feedback should be shown
        try {
          const welcomeDate = new Date(welcomeShown);
          const thresholdDate = getFeedbackThresholdDate();

          if (welcomeDate < thresholdDate) {
            showFeedback = true;
          }
        } catch (dateError) {
          console.warn('Invalid welcome date format:', welcomeShown);
          // Reset welcome status if date is corrupted
          showWelcome = true;
        }
      }

      setState({
        showWelcome,
        showFeedback,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      if (!abortController.current?.signal.aborted) {
        console.error('Error checking welcome status:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    }
  }, [user, profile, getStorageValue, getFeedbackThresholdDate]);

  // Optimized action handlers
  const markWelcomeShown = useCallback(async () => {
    const success = await setStorageValue(
      STORAGE_KEYS.WELCOME_SHOWN,
      new Date().toISOString()
    );
    if (success) {
      setState((prev) => ({ ...prev, showWelcome: false }));
    }
  }, [setStorageValue]);

  const markFeedbackShown = useCallback(async () => {
    const success = await setStorageValue(
      STORAGE_KEYS.FEEDBACK_REMINDER,
      new Date().toISOString()
    );
    if (success) {
      setState((prev) => ({ ...prev, showFeedback: false }));
    }
  }, [setStorageValue]);

  const showFeedbackManually = useCallback(() => {
    setState((prev) => ({ ...prev, showFeedback: true }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const retry = useCallback(() => {
    checkWelcomeStatus();
  }, [checkWelcomeStatus]);

  // Effect with proper cleanup and dependency optimization
  useEffect(() => {
    if (!isInitialized.current || (user && profile)) {
      isInitialized.current = true;
      checkWelcomeStatus();
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [user, profile, checkWelcomeStatus]);

  return {
    showWelcome: state.showWelcome,
    showFeedback: state.showFeedback,
    isLoading: state.isLoading,
    error: state.error,
    markWelcomeShown,
    markFeedbackShown,
    showFeedbackManually,
    clearError,
    retry,
  };
}
