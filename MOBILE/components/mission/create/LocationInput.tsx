import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { CreateMissionProps } from './types';
import { locationSuggestions } from '@/constants/specializations';

interface LocationInputProps extends CreateMissionProps {}

export function LocationInput({
  formData,
  setFormData,
  errors,
  setErrors,
  colors,
}: LocationInputProps) {
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const filteredLocationSuggestions = locationSuggestions.filter((location) =>
    location.toLowerCase().includes(formData.location.toLowerCase())
  );

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>Localisation *</Text>
      <View style={styles.locationContainer}>
        <View
          style={[
            styles.locationInputContainer,
            {
              backgroundColor: colors.card,
              borderColor: errors.location ? colors.error : colors.border,
            },
          ]}
        >
          <MapPin size={20} color={colors.muted} />
          <TextInput
            style={[styles.locationInput, { color: colors.text }]}
            value={formData.location}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, location: text }));
              setShowLocationSuggestions(text.length > 0);
              if (errors.location)
                setErrors((prev) => ({ ...prev, location: '' }));
            }}
            onFocus={() =>
              setShowLocationSuggestions(formData.location.length > 0)
            }
            placeholder="Ville ou région"
            placeholderTextColor={colors.muted}
          />
        </View>
        {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
          <View
            style={[
              styles.suggestionsContainer,
              { backgroundColor: colors.card },
            ]}
          >
            {filteredLocationSuggestions
              .slice(0, 5)
              .map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, location: suggestion }));
                    setShowLocationSuggestions(false);
                  }}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>
      {errors.location && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errors.location}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  locationContainer: {
    position: 'relative',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
