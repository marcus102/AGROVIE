import React from 'react';
import { ScrollView, ScrollViewProps, Platform } from 'react-native';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  extraScrollHeight?: number;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function KeyboardAwareScrollView({
  children,
  extraScrollHeight = 20,
  contentContainerStyle,
  ...props
}: KeyboardAwareScrollViewProps) {
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

  // Determine platform-specific behavior outside of the animated style
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  const animatedContentStyle = useAnimatedStyle(() => {
    let paddingBottom = 0;

    if (isIOS) {
      paddingBottom = withTiming(
        isKeyboardVisible ? keyboardHeight + extraScrollHeight : 0,
        { duration: 250 }
      );
    } else if (isAndroid) {
      paddingBottom = withTiming(isKeyboardVisible ? extraScrollHeight : 0, {
        duration: 250,
      });
    }

    return {
      paddingBottom,
    };
  });

  return (
    <AnimatedScrollView
      {...props}
      contentContainerStyle={[contentContainerStyle, animatedContentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </AnimatedScrollView>
  );
}
