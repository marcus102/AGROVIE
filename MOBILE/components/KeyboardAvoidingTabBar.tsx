import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardAware } from '@/hooks/useKeyboardAware';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface KeyboardAvoidingTabBarProps {
  children: React.ReactNode;
  backgroundColor?: string;
  borderTopColor?: string;
  height?: number;
}

export function KeyboardAvoidingTabBar({
  children,
  backgroundColor = 'transparent',
  borderTopColor = '#e5e7eb',
  height = 80,
}: KeyboardAvoidingTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isVisible: keyboardVisible, height: keyboardHeight } =
    useKeyboardAware();

  // Define platform-specific behavior outside of useAnimatedStyle
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  // Calculate the tab bar position based on keyboard state
  const animatedStyle = useAnimatedStyle(() => {
    // On iOS, we want to keep the tab bar visible above the keyboard
    // On Android, we hide it when keyboard is visible to prevent layout issues
    let translateY = 0;
    let opacity = 1;

    if (isIOS) {
      translateY = withTiming(keyboardVisible ? -keyboardHeight : 0, {
        duration: 250,
      });
      opacity = 1; // Always visible on iOS
    } else if (isAndroid) {
      translateY = withTiming(keyboardVisible ? height + insets.bottom : 0, {
        duration: 250,
      });
      opacity = withTiming(keyboardVisible ? 0 : 1, { duration: 200 });
    }

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Calculate container height including safe area
  const containerHeight = height + insets.bottom;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderTopColor,
          height: containerHeight,
          paddingBottom: insets.bottom,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.content, { height }]}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
