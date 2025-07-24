import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  return (
    <View style={[styles.progressContainer, { backgroundColor: colors.card }]}>
      <View style={styles.progressSteps}>
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map(
          (step) => (
            <View key={step} style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  {
                    backgroundColor:
                      step <= currentStep ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressNumber,
                    { color: step <= currentStep ? colors.card : colors.muted },
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < totalSteps && (
                <View
                  style={[
                    styles.progressLine,
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
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
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
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
