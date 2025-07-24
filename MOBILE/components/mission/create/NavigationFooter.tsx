import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface NavigationFooterProps {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  calculatingPrice: boolean;
  colors: any;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function NavigationFooter({
  currentStep,
  totalSteps,
  loading,
  calculatingPrice,
  colors,
  onPrevious,
  onNext,
  onSubmit,
}: NavigationFooterProps) {
  const isLastStep = currentStep === totalSteps;
  const isDisabled = loading || calculatingPrice;

  return (
    <View style={[styles.footer, { backgroundColor: colors.card }]}>
      <View style={styles.footerButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.backFooterButton,
              { borderColor: colors.border },
            ]}
            onPress={onPrevious}
            disabled={isDisabled}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              Précédent
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.nextFooterButton,
            { backgroundColor: colors.primary },
            isDisabled && styles.disabledButton,
          ]}
          onPress={isLastStep ? onSubmit : onNext}
          disabled={isDisabled}
        >
          {isDisabled ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={[styles.nextButtonText, { color: colors.card }]}>
              {isLastStep ? 'Créer la mission' : 'Suivant'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }, 
  backFooterButton: {
    borderWidth: 1,
  },
  nextFooterButton: {
    // backgroundColor set dynamically
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
