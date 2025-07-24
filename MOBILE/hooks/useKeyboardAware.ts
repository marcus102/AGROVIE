import { useEffect, useRef, useCallback, useReducer } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';

interface KeyboardInfo {
  readonly isVisible: boolean;
  readonly height: number;
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

const INITIAL_STATE: KeyboardInfo = {
  isVisible: false,
  height: 0,
} as const;

/**
 * Custom hook for tracking keyboard visibility and height
 * Optimized for performance with proper typing and cleanup
 */
export function useKeyboardAware(): KeyboardInfo {
  // Use useRef to store state to avoid unnecessary re-renders during updates
  const keyboardInfoRef = useRef<KeyboardInfo>(INITIAL_STATE);
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
    
    // Only update if there's an actual change
    if (!keyboardInfoRef.current.isVisible || keyboardInfoRef.current.height !== newHeight) {
      keyboardInfoRef.current = {
        isVisible: true,
        height: newHeight,
      };
      forceUpdate();
    }
  }, []);

  const handleKeyboardHide = useCallback(() => {
    // Only update if keyboard was previously visible
    if (keyboardInfoRef.current.isVisible) {
      keyboardInfoRef.current = INITIAL_STATE;
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
      // Add new listeners
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

  return keyboardInfoRef.current;
}