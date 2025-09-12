import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Calendar, ChevronDown, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CreateMissionProps, SurfaceUnit } from './types';

interface StepTwoProps extends CreateMissionProps {}

interface DropdownOption {
  value: SurfaceUnit;
  label: string;
}

export function StepTwo({
  formData,
  setFormData,
  errors,
  setErrors,
  colors,
}: StepTwoProps) {
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(
    null
  );
  const [showSurfaceUnitDropdown, setShowSurfaceUnitDropdown] = useState(false);

  // Memoized surface unit options to prevent recreation on every render
  const surfaceUnitOptions = useMemo<DropdownOption[]>(
    () => [
      { value: 'hectares', label: 'Hectares' },
      { value: 'square_meter', label: 'Mètres carrés' },
    ],
    []
  );

  // Memoized date formatter to prevent recreation
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  // Optimized date change handler
  const handleDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      const currentField = showDatePicker;
      setShowDatePicker(null);

      if (!selectedDate || !currentField) return;

      try {
        const field = currentField === 'start' ? 'start_date' : 'end_date';
        const dateString = selectedDate.toISOString().split('T')[0];

        setFormData((prev) => ({
          ...prev,
          [field]: dateString,
        }));

        // Clear error if it exists
        if (errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: '' }));
        }
      } catch (error) {
        console.error('Error handling date change:', error);
      }
    },
    [showDatePicker, setFormData, setErrors, errors]
  );

  // Optimized surface area change handler with validation
  const handleSurfaceAreaChange = useCallback(
    (text: string) => {
      try {
        // Allow empty string or valid numbers (including decimals)
        if (text === '' || /^\d*\.?\d*$/.test(text)) {
          const numValue = text === '' ? 0 : parseFloat(text);

          // Validate reasonable range
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 1000000) {
            setFormData((prev) => ({
              ...prev,
              surface_area: numValue,
            }));

            // Clear surface area error if it exists
            if (errors.surface_area) {
              setErrors((prev) => ({ ...prev, surface_area: '' }));
            }
          }
        }
      } catch (error) {
        console.error('Error handling surface area change:', error);
      }
    },
    [setFormData, setErrors, errors.surface_area]
  );

  // Surface unit selection handler
  const handleSurfaceUnitSelect = useCallback(
    (unit: SurfaceUnit) => {
      try {
        setFormData((prev) => ({
          ...prev,
          surface_unit: unit,
        }));
        setShowSurfaceUnitDropdown(false);
      } catch (error) {
        console.error('Error selecting surface unit:', error);
      }
    },
    [setFormData]
  );

  // Get current surface unit label
  const currentSurfaceUnitLabel = useMemo(() => {
    const option = surfaceUnitOptions.find(
      (opt) => opt.value === formData.surface_unit
    );
    return option?.label || 'Sélectionner';
  }, [formData.surface_unit, surfaceUnitOptions]);

  // Date picker minimum date calculation
  const getMinimumDate = useCallback(
    (type: 'start' | 'end') => {
      if (type === 'start') {
        return new Date();
      }
      return formData.start_date ? new Date(formData.start_date) : new Date();
    },
    [formData.start_date]
  );

  // Date picker value calculation
  const getDatePickerValue = useCallback(() => {
    if (!showDatePicker) return new Date();

    const dateField = showDatePicker === 'start' ? 'start_date' : 'end_date';
    const dateValue = formData[dateField];

    return dateValue ? new Date(dateValue) : new Date();
  }, [showDatePicker, formData]);

  // Dropdown item renderer
  const renderDropdownItem = useCallback(
    ({ item }: { item: DropdownOption }) => (
      <TouchableOpacity
        style={[styles.dropdownItem, { backgroundColor: colors.card }]}
        onPress={() => handleSurfaceUnitSelect(item.value)}
      >
        <Text style={[styles.dropdownItemText, { color: colors.text }]}>
          {item.label}
        </Text>
        {formData.surface_unit === item.value && (
          <Check size={16} color={colors.primary} />
        )}
      </TouchableOpacity>
    ),
    [colors, formData.surface_unit, handleSurfaceUnitSelect]
  );

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Dates et durée
      </Text>

      <View style={styles.dateRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Date de début *
          </Text>
          <TouchableOpacity
            style={[
              styles.dateInput,
              {
                backgroundColor: colors.card,
                borderColor: errors.start_date ? colors.error : colors.border,
              },
            ]}
            onPress={() => setShowDatePicker('start')}
            accessibilityRole="button"
            accessibilityLabel="Sélectionner la date de début"
          >
            <Calendar size={20} color={colors.muted} />
            <Text
              style={[
                styles.dateText,
                {
                  color: formData.start_date ? colors.text : colors.muted,
                },
              ]}
            >
              {formData.start_date
                ? formatDate(new Date(formData.start_date))
                : 'Sélectionner'}
            </Text>
          </TouchableOpacity>
          {errors.start_date && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.start_date}
            </Text>
          )}
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Date de fin *
          </Text>
          <TouchableOpacity
            style={[
              styles.dateInput,
              {
                backgroundColor: colors.card,
                borderColor: errors.end_date ? colors.error : colors.border,
              },
            ]}
            onPress={() => setShowDatePicker('end')}
            accessibilityRole="button"
            accessibilityLabel="Sélectionner la date de fin"
          >
            <Calendar size={20} color={colors.muted} />
            <Text
              style={[
                styles.dateText,
                { color: formData.end_date ? colors.text : colors.muted },
              ]}
            >
              {formData.end_date
                ? formatDate(new Date(formData.end_date))
                : 'Sélectionner'}
            </Text>
          </TouchableOpacity>
          {errors.end_date && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.end_date}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.surfaceRow}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Surface</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: errors.surface_area ? colors.error : colors.border,
              },
            ]}
            value={
              formData.surface_area > 0 ? formData.surface_area.toString() : ''
            }
            onChangeText={handleSurfaceAreaChange}
            placeholder="0"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            accessibilityLabel="Surface en nombre"
            maxLength={10}
          />
          {errors.surface_area && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.surface_area}
            </Text>
          )}
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Unité</Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
            onPress={() => setShowSurfaceUnitDropdown(true)}
            accessibilityRole="button"
            accessibilityLabel="Sélectionner l'unité de surface"
          >
            <Text style={[{ color: colors.text }]} numberOfLines={1}>
              {currentSurfaceUnitLabel}
            </Text>
            <ChevronDown size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={getDatePickerValue()}
          mode="date"
          display="default"
          minimumDate={getMinimumDate(showDatePicker)}
          onChange={handleDateChange}
        />
      )}

      {/* Surface Unit Dropdown Modal */}
      <Modal
        visible={showSurfaceUnitDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSurfaceUnitDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSurfaceUnitDropdown(false)}
        >
          <View
            style={[styles.dropdownContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>
              Sélectionner l'unité
            </Text>
            <FlatList
              data={surfaceUnitOptions}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.value}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
  },
  surfaceRow: {
    flexDirection: 'row',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    borderRadius: 12,
    padding: 16,
    minWidth: 250,
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
  },
});
