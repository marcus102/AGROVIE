import { useEffect, useRef, useCallback, useReducer } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

interface KeyboardState {
  readonly keyboardHeight: number;
  readonly isKeyboardVisible: boolean;
}

interface KeyboardEventData {
  endCoordinates: {
    height: number;
    screenX: number;
    screenY: number;
    width: number;
  };
  startCoordinates: {
    height: number;
    screenX: number;
    screenY: number;
    width: number;
  };
  duration?: number;
  easing?: string;
}

// Constants for better performance and maintainability
const KEYBOARD_EVENTS = {
  show: Platform.select({
    ios: 'keyboardWillShow' as const,
    default: 'keyboardDidShow' as const,
  }),
  hide: Platform.select({
    ios: 'keyboardWillHide' as const,
    default: 'keyboardDidHide' as const,
  }),
} as const;

const INITIAL_STATE: KeyboardState = {
  keyboardHeight: 0,
  isKeyboardVisible: false,
} as const;

/**
 * Hook to track keyboard height and visibility
 * Provides smooth keyboard height tracking for better UX
 * Optimized for performance with proper typing and cleanup
 *
 * @returns Object containing keyboardHeight and isKeyboardVisible
 */
export function useKeyboardHeight(): KeyboardState {
  // Use useRef to store state to minimize re-renders
  const keyboardStateRef = useRef<KeyboardState>(INITIAL_STATE);
  const listenersRef = useRef<{
    show?: ReturnType<typeof Keyboard.addListener>;
    hide?: ReturnType<typeof Keyboard.addListener>;
  }>({});

  // Force component re-render when keyboard state changes
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Memoized handlers to prevent recreation on every render
  const handleKeyboardShow = useCallback((event: KeyboardEvent) => {
    const eventData = event as unknown as KeyboardEventData;
    const newHeight = eventData?.endCoordinates?.height ?? 0;

    // Only update if there's an actual change to prevent unnecessary re-renders
    const currentState = keyboardStateRef.current;
    if (
      !currentState.isKeyboardVisible ||
      currentState.keyboardHeight !== newHeight
    ) {
      keyboardStateRef.current = {
        keyboardHeight: newHeight,
        isKeyboardVisible: true,
      };
      forceUpdate();
    }
  }, []);

  const handleKeyboardHide = useCallback(() => {
    // Only update if keyboard was previously visible
    if (keyboardStateRef.current.isKeyboardVisible) {
      keyboardStateRef.current = INITIAL_STATE;
      forceUpdate();
    }
  }, []);

  // Cleanup function to remove listeners
  const cleanup = useCallback(() => {
    if (listenersRef.current.show) {
      listenersRef.current.show.remove();
      listenersRef.current.show = undefined;
    }
    if (listenersRef.current.hide) {
      listenersRef.current.hide.remove();
      listenersRef.current.hide = undefined;
    }
  }, []);

  useEffect(() => {
    // Clean up any existing listeners first
    cleanup();

    try {
      // Add new listeners with error handling
      listenersRef.current.show = Keyboard.addListener(
        KEYBOARD_EVENTS.show,
        handleKeyboardShow
      );
      listenersRef.current.hide = Keyboard.addListener(
        KEYBOARD_EVENTS.hide,
        handleKeyboardHide
      );
    } catch (error) {
      // Handle potential errors in listener setup
      console.warn('Failed to set up keyboard listeners:', error);
      cleanup();
    }

    // Cleanup on unmount
    return cleanup;
  }, [handleKeyboardShow, handleKeyboardHide, cleanup]);

  return keyboardStateRef.current;
}
