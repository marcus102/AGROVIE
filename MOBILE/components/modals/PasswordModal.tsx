import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { BaseModal } from './BaseModal';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth';

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PasswordField {
  value: string;
  visible: boolean;
  error?: string;
}

export function PasswordModal({ visible, onClose }: PasswordModalProps) {
  const { colors } = useThemeStore();
  const [currentPassword, setCurrentPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  });
  const [newPassword, setNewPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  });
  const [confirmPassword, setConfirmPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  });
  // const [loading, setLoading] = useState(false);
  // const [localError, setLocalError] = useState<string | null>(null);
  const { resetPassword, loading, error, setError } = useAuthStore();

  const handlePasswordChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<PasswordField>>) => {
      return (text: string) => {
        setter((prev) => {
          if (prev.value === text) return prev; // Avoid unnecessary state updates
          return { ...prev, value: text, error: undefined };
        });
      };
    },
    []
  );

  const handleToggleVisibility = useCallback(
    (setter: React.Dispatch<React.SetStateAction<PasswordField>>) => {
      return () => {
        setter((prev) => ({ ...prev, visible: !prev.visible }));
      };
    },
    []
  );

  const validateForm = () => {
    let isValid = true;
    const updates: Record<string, PasswordField> = {};

    if (!currentPassword.value) {
      updates.currentPassword = {
        ...currentPassword,
        error: 'Le mot de passe actuel est requis',
      };
      isValid = false;
    }

    if (!newPassword.value) {
      updates.newPassword = {
        ...newPassword,
        error: 'Le nouveau mot de passe est requis',
      };
      isValid = false;
    } else if (newPassword.value.length < 8) {
      updates.newPassword = {
        ...newPassword,
        error: 'Le mot de passe doit contenir au moins 8 caractères',
      };
      isValid = false;
    }

    if (!confirmPassword.value) {
      updates.confirmPassword = {
        ...confirmPassword,
        error: 'La confirmation du mot de passe est requise',
      };
      isValid = false;
    } else if (confirmPassword.value !== newPassword.value) {
      updates.confirmPassword = {
        ...confirmPassword,
        error: 'Les mots de passe ne correspondent pas',
      };
      isValid = false;
    }

    if (!isValid) {
      if (updates.currentPassword) setCurrentPassword(updates.currentPassword);
      if (updates.newPassword) setNewPassword(updates.newPassword);
      if (updates.confirmPassword) setConfirmPassword(updates.confirmPassword);
    }

    return isValid;
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate the form
    if (!validateForm()) return;

    // Check password requirements
    const checkPasswordRequirement = (requirement: string) => {
      const { value: password } = newPassword;
      switch (requirement) {
        case 'length':
          return password.length >= 8;
        case 'uppercase':
          return /[A-Z]/.test(password);
        case 'lowercase':
          return /[a-z]/.test(password);
        case 'number':
          return /[0-9]/.test(password);
        case 'special':
          return /[!@#$%^&*(),.?":{}|<>]/.test(password);
        default:
          return false;
      }
    };

    if (
      !checkPasswordRequirement('length') ||
      !checkPasswordRequirement('uppercase') ||
      !checkPasswordRequirement('lowercase') ||
      !checkPasswordRequirement('number') ||
      !checkPasswordRequirement('special')
    ) {
      return;
    }

    // Show confirmation popup
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir modifier votre mot de passe ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await resetPassword(newPassword.value);

              Alert.alert(
                'Succès',
                'Votre mot de passe a été modifié avec succès.'
              );

              // Reset fields and close modal
              resetFields();
              onClose();
            } catch (err) {
              // Handle error from Supabase
            }
          },
        },
      ]
    );
  };

  const resetFields = () => {
    setCurrentPassword({ value: '', visible: false, error: undefined });
    setNewPassword({ value: '', visible: false, error: undefined });
    setConfirmPassword({ value: '', visible: false, error: undefined });
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Modifier le mot de passe
        </Text>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={[styles.requirementsTitle, { color: colors.text }]}>
            Le mot de passe doit contenir :
          </Text>
          <Text style={[styles.requirement, { color: colors.text }]}>
            • Au moins 8 caractères
          </Text>
          <Text style={[styles.requirement, { color: colors.text }]}>
            • Une lettre majuscule (A-Z)
          </Text>
          <Text style={[styles.requirement, { color: colors.text }]}>
            • Une lettre minuscule (a-z)
          </Text>
          <Text style={[styles.requirement, { color: colors.text }]}>
            • Un chiffre (0-9)
          </Text>
          <Text style={[styles.requirement, { color: colors.text }]}>
            • Un caractère spécial (!@#$%^&*(),.?":{}|)
          </Text>
        </View>

        {error && (
          <View
            style={[
              styles.globalError,
              { backgroundColor: colors.error + '20' },
            ]}
          >
            <AlertCircle size={20} color={colors.error} />
            <Text style={[styles.globalErrorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        <PasswordInput
          label="Mot de passe actuel"
          value={currentPassword.value}
          visible={currentPassword.visible}
          error={currentPassword.error}
          onChangeText={handlePasswordChange(setCurrentPassword)}
          onToggleVisibility={handleToggleVisibility(setCurrentPassword)}
          testID="current-password"
        />

        <PasswordInput
          label="Nouveau mot de passe"
          value={newPassword.value}
          visible={newPassword.visible}
          error={newPassword.error}
          onChangeText={handlePasswordChange(setNewPassword)}
          onToggleVisibility={handleToggleVisibility(setNewPassword)}
          testID="new-password"
        />

        <PasswordInput
          label="Confirmer le nouveau mot de passe"
          value={confirmPassword.value}
          visible={confirmPassword.visible}
          error={confirmPassword.error}
          onChangeText={handlePasswordChange(setConfirmPassword)}
          onToggleVisibility={handleToggleVisibility(setConfirmPassword)}
          testID="confirm-password"
        />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              resetFields();
              onClose();
            }}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Annuler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.submitButtonText]}>
              {loading ? 'Modification...' : 'Modifier'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseModal>
  );
}

const PasswordInput = React.memo(
  ({
    label,
    value,
    visible,
    error,
    onChangeText,
    onToggleVisibility,
    testID,
  }: {
    label: string;
    value: string;
    visible: boolean;
    error?: string;
    onChangeText: (text: string) => void;
    onToggleVisibility: () => void;
    testID: string;
  }) => {
    const { colors } = useThemeStore();

    return (
      <Animated.View entering={FadeInDown} style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.card,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!visible}
            placeholderTextColor={colors.muted}
            testID={testID}
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={onToggleVisibility}
          >
            {visible ? (
              <EyeOff size={20} color={colors.muted} />
            ) : (
              <Eye size={20} color={colors.muted} />
            )}
          </TouchableOpacity>
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingBottom: 10,
    paddingTop: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
  },
  globalError: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  globalErrorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
  },
  visibilityToggle: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 25,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#166534',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#ffffff',
  },
  requirementsContainer: {
    marginBottom: 16,
  },
  requirementsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  requirement: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
});
