import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { X, Save, Bookmark } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useQuickStartStore } from '@/stores/quick_starts';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface QuickStartSaveModalProps {
  visible: boolean;
  onClose: () => void;
  missionData: Record<string, any>;
  onSaved?: () => void;
}

export function QuickStartSaveModal({
  visible,
  onClose,
  missionData,
  onSaved,
}: QuickStartSaveModalProps) {
  const { colors } = useThemeStore();
  const { createQuickStart, loading, error } = useQuickStartStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour votre modèle');
      return;
    }

    try {
      await createQuickStart({
        title: title.trim(),
        description: description.trim() || undefined,
        mission_data: missionData,
      });

      // Success - close modal and call onSaved callback
      handleClose();
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de sauvegarder le modèle. Veuillez réessayer.'
      );
      // Don't close modal on error so user can retry
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleSkip = () => {
    // Close modal and call onSaved callback even when skipping
    handleClose();
    if (onSaved) {
      onSaved();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.container, { backgroundColor: colors.card }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Bookmark size={24} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Sauvegarder comme modèle
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={handleSkip}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Créez un modèle réutilisable pour vos futures missions similaires
            </Text>

            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Titre du modèle *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ex: Récolte de céréales - Été"
                placeholderTextColor={colors.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Description (optionnel)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Décrivez brièvement ce modèle..."
                placeholderTextColor={colors.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Info Box */}
            <View
              style={[
                styles.infoBox,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <Text style={[styles.infoText, { color: colors.text }]}>
                💡 Ce modèle sera disponible dans la section "Démarrage rapide"
                pour créer rapidement des missions similaires.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleSkip}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Passer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: title.trim() ? colors.primary : colors.muted,
                },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim() || loading}
            >
              <Save size={20} color={colors.card} />
              <Text style={[styles.saveButtonText, { color: colors.card }]}>
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 80,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
