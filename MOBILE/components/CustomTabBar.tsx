import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '@/stores/theme';
import { KeyboardAvoidingTabBar } from './KeyboardAvoidingTabBar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { usePathname } from 'expo-router';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors, theme } = useThemeStore();
  const pathname = usePathname();

  // Hide tab bar on create page
  if (
    pathname === '/new/create' ||
    pathname === '/settings/email' ||
    pathname === '/settings/password' ||
    pathname === '/profile/edit' ||
    pathname === '/profile/dashboard/advisor' ||
    pathname === '/profile/dashboard/admin' ||
    pathname === '/profile/dashboard/worker' ||
    pathname === '/profile/dashboard/entrepreneur'
  ) {
    return null;
  }

  return (
    <KeyboardAvoidingTabBar
      backgroundColor="transparent"
      borderTopColor="transparent"
      height={90}
    >
      <View style={styles.container}>
        {/* Enhanced Background with Multiple Layers */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 120 : 100}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Gradient Overlay with Better Colors */}
        <LinearGradient
          colors={[colors.card + 'E8', colors.card + 'F5', colors.card + 'FF']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Subtle Top Border Gradient */}
        <LinearGradient
          colors={[
            'transparent',
            colors.border + '40',
            colors.border + '80',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBorder}
        />

        {/* Tab Items Container */}
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                label={typeof label === 'string' ? label : 'Tab'}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                icon={options.tabBarIcon}
                colors={colors}
                index={index}
                totalTabs={state.routes.length}
              />
            );
          })}
        </View>
      </View>
    </KeyboardAvoidingTabBar>
  );
}

interface TabItemProps {
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  icon?: (props: {
    focused: boolean;
    color: string;
    size: number;
  }) => React.ReactNode;
  colors: any;
  index: number;
  totalTabs: number;
}

function TabItem({
  label,
  isFocused,
  onPress,
  onLongPress,
  icon,
  colors,
  index,
  totalTabs,
}: TabItemProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const labelOpacity = useSharedValue(isFocused ? 1 : 0.7);
  const backgroundOpacity = useSharedValue(isFocused ? 1 : 0);

  // Enhanced animated styles for the tab container
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scaleValue = withSpring(isFocused ? 1.05 : 1, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });

    const translateYValue = withSpring(isFocused ? -6 : 0, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });

    return {
      transform: [{ scale: scaleValue }, { translateY: translateYValue }],
    };
  });

  // Enhanced background with better visual hierarchy
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      backgroundOpacity.value,
      [0, 1],
      ['transparent', colors.primary + '15']
    );

    const borderColor = interpolateColor(
      backgroundOpacity.value,
      [0, 1],
      ['transparent', colors.primary + '30']
    );

    const shadowOpacity = withTiming(isFocused ? 0.15 : 0, {
      duration: 300,
    });

    const shadowRadius = withTiming(isFocused ? 12 : 0, {
      duration: 300,
    });

    return {
      backgroundColor,
      borderColor,
      shadowOpacity,
      shadowRadius,
      borderWidth: isFocused ? 1 : 0,
    };
  });

  // Enhanced icon animations
  const animatedIconStyle = useAnimatedStyle(() => {
    const iconScaleValue = withSpring(isFocused ? 1.15 : 1, {
      damping: 15,
      stiffness: 200,
      mass: 0.6,
    });

    const iconTranslateY = withSpring(isFocused ? -2 : 0, {
      damping: 15,
      stiffness: 200,
    });

    return {
      transform: [{ scale: iconScaleValue }, { translateY: iconTranslateY }],
    };
  });

  // Enhanced label animations
  const animatedLabelStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isFocused ? 1 : 0.6, {
      duration: 250,
    });

    const color = interpolateColor(
      isFocused ? 1 : 0,
      [0, 1],
      [colors.muted, colors.primary]
    );

    const fontWeight = isFocused ? '700' : '500';

    const labelScale = withSpring(isFocused ? 1.05 : 1, {
      damping: 15,
      stiffness: 200,
    });

    return {
      opacity,
      color,
      fontWeight,
      transform: [{ scale: labelScale }],
    };
  });

  // Pulse effect for active state
  const animatedPulseStyle = useAnimatedStyle(() => {
    const pulseScale = isFocused
      ? withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.3, { duration: 600 }),
          withTiming(1, { duration: 600 })
        )
      : withTiming(0, { duration: 200 });

    const pulseOpacity = isFocused
      ? withSequence(
          withTiming(0.6, { duration: 0 }),
          withTiming(0, { duration: 1200 })
        )
      : withTiming(0, { duration: 200 });

    return {
      transform: [{ scale: pulseScale }],
      opacity: pulseOpacity,
    };
  });

  // Update shared values when focus changes
  React.useEffect(() => {
    backgroundOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 300 });
    labelOpacity.value = withTiming(isFocused ? 1 : 0.7, { duration: 250 });
  }, [isFocused]);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    iconScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    translateY.value = withSpring(2, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    iconScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    translateY.value = withSpring(isFocused ? -6 : 0, {
      damping: 15,
      stiffness: 200,
    });
  };

  return (
    <AnimatedTouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={`${label} tab`}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabItem, animatedContainerStyle]}
      activeOpacity={1}
    >
      {/* Enhanced Tab Background */}
      <Animated.View style={animatedBackgroundStyle}>
        {/* Gradient Background for Active Tab */}
        {isFocused && (
          <LinearGradient
            colors={[
              colors.primary + '08',
              colors.primary + '12',
              colors.primary + '08',
            ]}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Pulse Effect Background */}
        <Animated.View
          style={[
            styles.pulseBackground,
            { backgroundColor: colors.primary + '20' },
            animatedPulseStyle,
          ]}
        />
      </Animated.View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {/* Enhanced Icon Container */}
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <View style={styles.iconWrapper}>
            {icon &&
              icon({
                focused: isFocused,
                color: isFocused ? colors.primary : colors.muted,
                size: 26,
              })}
          </View>

          {/* Active Dot Indicator with Glow */}
          {isFocused && (
            <Animated.View
              style={[
                styles.activeDot,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.dotGlow,
                  { backgroundColor: colors.primary + '40' },
                ]}
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Enhanced Label */}
        <Animated.Text
          style={[styles.tabLabel, animatedLabelStyle]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    position: 'relative',
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 70,
    maxWidth: 80,
  },
  pulseBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  activeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dotGlow: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -3,
    left: -3,
  },
  tabLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 14,
  },
});
