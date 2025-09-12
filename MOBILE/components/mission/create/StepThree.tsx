import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import {
  CreateMissionProps,
  UserRole,
  ExperienceLevel,
  AdvantageType,
} from './types';
import {
  advisorSpecializations,
  workerSpecializations,
  roleLabels,
  advantageOptions,
  experienceLevelLabels,
} from '@/constants/specializations';

interface StepThreeProps extends CreateMissionProps {}

export function StepThree({
  formData,
  setFormData,
  errors,
  setErrors,
  colors,
}: StepThreeProps) {
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [showExperienceLevelModal, setShowExperienceLevelModal] = useState(false);

  // Memoized specialization options to prevent unnecessary recalculations
  const specializationOptions = useMemo(() => {
    return formData.needed_actor === 'advisor'
      ? advisorSpecializations
      : workerSpecializations;
  }, [formData.needed_actor]);

  // Memoized experience levels
  const experienceLevels = useMemo<ExperienceLevel[]>(() => [
    'starter',
    'qualified',
    'expert',
  ], []);

  // Optimized handlers using useCallback to prevent unnecessary re-renders
  const handleRoleSelect = useCallback((role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      needed_actor: role,
      actor_specialization: '', // Reset specialization when role changes
    }));
    
    // Clear related errors
    if (errors.actor_specialization) {
      setErrors((prev) => ({
        ...prev,
        actor_specialization: '',
      }));
    }
  }, [errors.actor_specialization, setFormData, setErrors]);

  const handleSpecializationSelect = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      actor_specialization: value,
    }));
    
    setShowSpecializationModal(false);
    
    // Clear related errors
    if (errors.actor_specialization) {
      setErrors((prev) => ({
        ...prev,
        actor_specialization: '',
      }));
    }
  }, [errors.actor_specialization, setFormData, setErrors]);

  const handleExperienceLevelSelect = useCallback((level: ExperienceLevel) => {
    setFormData((prev) => ({
      ...prev,
      required_experience_level: level,
    }));
    
    setShowExperienceLevelModal(false);
    
    // Clear related errors
    if (errors.required_experience_level) {
      setErrors((prev) => ({
        ...prev,
        required_experience_level: '',
      }));
    }
  }, [errors.required_experience_level, setFormData, setErrors]);

  const handleActorAmountChange = useCallback((increment: boolean) => {
    setFormData((prev) => ({
      ...prev,
      needed_actor_amount: increment
        ? prev.needed_actor_amount + 1
        : Math.max(1, prev.needed_actor_amount - 1),
    }));
    
    // Clear error when user interacts
    if (errors.needed_actor_amount) {
      setErrors((prev) => ({
        ...prev,
        needed_actor_amount: '',
      }));
    }
  }, [errors.needed_actor_amount, setFormData, setErrors]);

  const handleOtherSpecializationChange = useCallback((text: string) => {
    setFormData((prev) => ({
      ...prev,
      other_actor_specialization: text,
    }));
    
    // Clear error as user types
    if (errors.other_actor_specialization) {
      setErrors((prev) => ({
        ...prev,
        other_actor_specialization: '',
      }));
    }
  }, [errors.other_actor_specialization, setFormData, setErrors]);

  const handleEquipmentToggle = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      equipment: !prev.equipment,
    }));
  }, [setFormData]);

  const handleAdvantageToggle = useCallback((advantageValue: AdvantageType) => {
    setFormData((prev) => ({
      ...prev,
      proposed_advantages: prev.proposed_advantages.includes(advantageValue)
        ? prev.proposed_advantages.filter((a) => a !== advantageValue)
        : [...prev.proposed_advantages, advantageValue],
    }));
  }, [setFormData]);

  // Memoized selected specialization display text
  const selectedSpecializationText = useMemo(() => {
    if (!formData.actor_specialization) {
      return 'Sélectionner une spécialisation';
    }
    
    const selectedOption = specializationOptions.find(
      (opt) => opt.value === formData.actor_specialization
    );
    
    return selectedOption?.label || 'Sélectionner';
  }, [formData.actor_specialization, specializationOptions]);

  // Safe modal close handlers
  const closeSpecializationModal = useCallback(() => {
    setShowSpecializationModal(false);
  }, []);

  const closeExperienceLevelModal = useCallback(() => {
    setShowExperienceLevelModal(false);
  }, []);

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Profil recherché
      </Text>

      {/* Actor Type Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Type d'acteur
        </Text>
        <View style={styles.roleSelector}>
          {(['worker', 'advisor'] as UserRole[]).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleOption,
                {
                  backgroundColor:
                    formData.needed_actor === role
                      ? colors.primary
                      : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleRoleSelect(role)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.roleText,
                  {
                    color:
                      formData.needed_actor === role
                        ? colors.card
                        : colors.text,
                  },
                ]}
              >
                {roleLabels[role]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Specialization Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Spécialisation *
        </Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.dropdownInput,
            {
              backgroundColor: colors.card,
              borderColor: errors.actor_specialization
                ? colors.error
                : colors.border,
            },
          ]}
          onPress={() => setShowSpecializationModal(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownText,
              {
                color: formData.actor_specialization
                  ? colors.text
                  : colors.muted,
              },
            ]}
          >
            {selectedSpecializationText}
          </Text>
          <ChevronDown size={20} color={colors.muted} />
        </TouchableOpacity>
        {errors.actor_specialization && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.actor_specialization}
          </Text>
        )}
      </View>

      {/* Other Specialization Input */}
      {formData.actor_specialization === 'other' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Précisez la spécialisation *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: errors.other_actor_specialization
                  ? colors.error
                  : colors.border,
              },
            ]}
            value={formData.other_actor_specialization || ''}
            onChangeText={handleOtherSpecializationChange}
            placeholder="Décrivez la spécialisation requise"
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            maxLength={200}
          />
          {errors.other_actor_specialization && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.other_actor_specialization}
            </Text>
          )}
        </View>
      )}

      {/* Number of People and Experience Level Row */}
      <View style={styles.row}>
        {/* Number of People */}
        <View style={[styles.inputGroup, styles.halfWidth, styles.marginRight]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Nombre de personnes *
          </Text>
          <View
            style={[
              styles.numberInputContainer,
              {
                backgroundColor: colors.card,
                borderColor: errors.needed_actor_amount
                  ? colors.error
                  : colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.numberButton, { backgroundColor: colors.border }]}
              onPress={() => handleActorAmountChange(false)}
              activeOpacity={0.7}
              disabled={formData.needed_actor_amount <= 1}
            >
              <Text 
                style={[
                  styles.numberButtonText, 
                  { 
                    color: formData.needed_actor_amount <= 1 ? colors.muted : colors.text,
                  }
                ]}
              >
                -
              </Text>
            </TouchableOpacity>
            <Text style={[styles.numberValue, { color: colors.text }]}>
              {formData.needed_actor_amount}
            </Text>
            <TouchableOpacity
              style={[styles.numberButton, { backgroundColor: colors.border }]}
              onPress={() => handleActorAmountChange(true)}
              activeOpacity={0.7}
              disabled={formData.needed_actor_amount >= 99}
            >
              <Text 
                style={[
                  styles.numberButtonText, 
                  { 
                    color: formData.needed_actor_amount >= 99 ? colors.muted : colors.text,
                  }
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
          {errors.needed_actor_amount && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.needed_actor_amount}
            </Text>
          )}
        </View>

        {/* Experience Level */}
        <View style={[styles.inputGroup, styles.halfWidth, styles.marginLeft]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Niveau d'expérience *
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dropdownInput,
              {
                backgroundColor: colors.card,
                borderColor: errors.required_experience_level
                  ? colors.error
                  : colors.border,
              },
            ]}
            onPress={() => setShowExperienceLevelModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>
              {experienceLevelLabels[formData.required_experience_level]}
            </Text>
            <ChevronDown size={20} color={colors.muted} />
          </TouchableOpacity>
          {errors.required_experience_level && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.required_experience_level}
            </Text>
          )}
        </View>
      </View>

      {/* Equipment Checkbox */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Équipement fourni
        </Text>
        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handleEquipmentToggle}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: formData.equipment
                  ? colors.primary
                  : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            {formData.equipment && <Check size={16} color={colors.card} />}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            Vous fournirez l'équipement nécessaire pour la mission
          </Text>
        </TouchableOpacity>
      </View>

      {/* Advantages Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Avantages proposés
        </Text>
        <View style={styles.advantagesGrid}>
          {advantageOptions.map((advantage) => {
            const isSelected = formData.proposed_advantages.includes(
              advantage.value as AdvantageType
            );
            
            return (
              <TouchableOpacity
                key={advantage.value}
                style={[
                  styles.advantageOption,
                  {
                    backgroundColor: isSelected
                      ? colors.primary + '20'
                      : colors.card,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => handleAdvantageToggle(advantage.value as AdvantageType)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.advantageText,
                    {
                      color: isSelected ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {advantage.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Specialization Modal */}
      <Modal
        visible={showSpecializationModal}
        transparent
        animationType="slide"
        onRequestClose={closeSpecializationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Choisir une spécialisation
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeSpecializationModal}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {specializationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        formData.actor_specialization === option.value
                          ? colors.primary + '20'
                          : 'transparent',
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => handleSpecializationSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.modalOptionText, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {option.label}
                  </Text>
                  {formData.actor_specialization === option.value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Experience Level Modal */}
      <Modal
        visible={showExperienceLevelModal}
        transparent
        animationType="slide"
        onRequestClose={closeExperienceLevelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Niveau d'expérience
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeExperienceLevelModal}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        formData.required_experience_level === level
                          ? colors.primary + '20'
                          : 'transparent',
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => handleExperienceLevelSelect(level)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.modalOptionText, { color: colors.text }]}
                  >
                    {experienceLevelLabels[level]}
                  </Text>
                  {formData.required_experience_level === level && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
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
    minHeight: 48,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    flex: 1,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  roleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  marginRight: {
    marginRight: 8,
  },
  marginLeft: {
    marginLeft: 8,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 2,
    height: 48,
  },
  numberButton: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  numberButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
    minHeight: 56,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  advantageOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  advantageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  modalOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});