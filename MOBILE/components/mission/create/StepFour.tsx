import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { CreateMissionProps } from './types';
import { ImageUpload } from './ImageUpload';

interface StepFourProps extends CreateMissionProps {
  uploadingImages: { [key: string]: number };
  handleImagePicker: () => void;
  removeImage: (index: number) => void;
}

export function StepFour({
  formData,
  setFormData,
  errors,
  colors,
  uploadingImages,
  handleImagePicker,
  removeImage,
}: StepFourProps) {
  // Ensure adjustment_price is always 0 and calculate final price
  React.useEffect(() => {
    const basePrice = parseFloat(formData.original_price || '0');
    const finalPrice = basePrice.toString();

    setFormData((prev) => ({
      ...prev,
      adjustment_price: '0',
      final_price: finalPrice,
    }));
  }, [formData.original_price, setFormData]);

  // Format price for display with proper number formatting and error handling
  const formatPrice = (price: string): string => {
    try {
      const numericPrice = parseFloat(price || '0');
      return isNaN(numericPrice) ? '0' : numericPrice.toLocaleString('fr-FR');
    } catch (error) {
      console.warn('Price formatting error:', error);
      return '0';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Prix et images</Text>

      <View style={styles.priceSection}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Prix de base (calculé) *
          </Text>
          <View
            style={[
              styles.priceInputContainer,
              {
                backgroundColor: colors.card,
                borderColor: errors.original_price
                  ? colors.error
                  : colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.priceInput, { color: colors.text }]}
              value={formData.original_price || ''}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              editable={false}
              accessibilityLabel="Prix de base calculé"
              accessibilityHint="Ce prix est calculé automatiquement"
            />
          </View>
          {errors.original_price && (
            <Text
              style={[styles.errorText, { color: colors.error }]}
              accessibilityRole="alert"
            >
              {errors.original_price}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.finalPriceContainer,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Text style={[styles.finalPriceLabel, { color: colors.primary }]}>
            Prix final
          </Text>
          <Text
            style={[styles.finalPriceValue, { color: colors.primary }]}
            accessibilityLabel={`Prix final: ${formatPrice(
              formData.final_price
            )} FCFA`}
          >
            {formatPrice(formData.final_price)} FCFA
          </Text>
        </View>
      </View>

      <ImageUpload
        formData={formData}
        setFormData={setFormData}
        colors={colors}
        uploadingImages={uploadingImages}
        handleImagePicker={handleImagePicker}
        removeImage={removeImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 29,
    marginBottom: 24,
  },
  priceSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  priceInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'right',
  },
  finalPriceContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  finalPriceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 4,
  },
  finalPriceValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 29,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 15,
    marginTop: 4,
  },
});
