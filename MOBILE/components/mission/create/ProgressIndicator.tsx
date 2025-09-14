import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  colors: any;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  colors,
}: ProgressIndicatorProps) {
  // Get screen dimensions
  const { width: screenWidth } = Dimensions.get('window');

  // Calculate dynamic spacing based on screen size and number of steps
  const getResponsiveSpacing = () => {
    const baseCircleSize = 32;
    const baseHorizontalPadding = 16;
    const availableWidth = screenWidth - baseHorizontalPadding * 2;
    const totalCircleWidth = totalSteps * baseCircleSize;
    const totalLineCount = totalSteps - 1;

    // Calculate optimal line width and spacing
    const remainingWidth = availableWidth - totalCircleWidth;
    const optimalLineWidth = Math.max(
      20, // Minimum line width
      Math.min(
        60, // Maximum line width
        remainingWidth / (totalLineCount * 3) // Divide by 3 to account for margins
      )
    );

    const optimalMargin = Math.max(
      4, // Minimum margin
      Math.min(
        12, // Maximum margin
        (remainingWidth - totalLineCount * optimalLineWidth) /
          (totalLineCount * 2)
      )
    );

    return {
      lineWidth: optimalLineWidth,
      lineMargin: optimalMargin,
      circleSize: screenWidth < 350 ? 28 : baseCircleSize, // Smaller circles on very small screens
      fontSize: screenWidth < 350 ? 12 : 14,
      containerPadding: screenWidth < 350 ? 12 : baseHorizontalPadding,
    };
  };

  const spacing = getResponsiveSpacing();

  // Dynamic styles based on calculated spacing
  const dynamicStyles = StyleSheet.create({
    progressContainer: {
      paddingHorizontal: spacing.containerPadding,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      backgroundColor: colors.card,
    },
    progressCircle: {
      width: spacing.circleSize,
      height: spacing.circleSize,
      borderRadius: spacing.circleSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressNumber: {
      fontFamily: 'Inter-SemiBold',
      fontSize: spacing.fontSize,
    },
    progressLine: {
      width: spacing.lineWidth,
      height: 2,
      marginHorizontal: spacing.lineMargin,
    },
  });

  return (
    <View style={dynamicStyles.progressContainer}>
      <View style={styles.progressSteps}>
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map(
          (step) => (
            <View key={step} style={styles.progressStep}>
              <View
                style={[
                  dynamicStyles.progressCircle,
                  {
                    backgroundColor:
                      step <= currentStep ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    dynamicStyles.progressNumber,
                    { color: step <= currentStep ? colors.card : colors.muted },
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < totalSteps && (
                <View
                  style={[
                    dynamicStyles.progressLine,
                    {
                      backgroundColor:
                        step < currentStep ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
            </View>
          )
        )}
      </View>
      <Text style={[styles.progressText, { color: colors.muted }]}>
        Étape {currentStep} sur {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
