import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { CreateMissionProps } from './types';
import { LocationInput } from './LocationInput';

interface StepOneProps extends CreateMissionProps {}

export function StepOne({
  formData,
  setFormData,
  errors,
  setErrors,
  colors,
}: StepOneProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Informations générales
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Titre de la mission *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: errors.mission_title ? colors.error : colors.border,
            },
          ]}
          value={formData.mission_title}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, mission_title: text }));
            if (errors.mission_title)
              setErrors((prev) => ({ ...prev, mission_title: '' }));
          }}
          placeholder="Ex: Récolte de maïs"
          placeholderTextColor={colors.muted}
        />
        {errors.mission_title && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.mission_title}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Description détaillée *
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: errors.mission_description
                ? colors.error
                : colors.border,
            },
          ]}
          value={formData.mission_description}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, mission_description: text }));
            if (errors.mission_description)
              setErrors((prev) => ({ ...prev, mission_description: '' }));
          }}
          placeholder="Décrivez en détail la mission, les tâches à accomplir, les conditions de travail..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={4}
        />
        {errors.mission_description && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.mission_description}
          </Text>
        )}
      </View>

      <LocationInput
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        colors={colors}
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Besoins personnalisés (optionnel)
        </Text>
        <Text style={[styles.labelDescription, { color: colors.muted }]}>
          Exprimez des besoins spécifiques (ex: préférence pour un travailleur
          précédent, exigences particulières...)
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Décrivez vos besoins personnalisés pour cette mission..."
          placeholderTextColor={colors.muted}
          value={formData.personalized_expression}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, personalized_expression: text }))
          }
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
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
  labelDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
