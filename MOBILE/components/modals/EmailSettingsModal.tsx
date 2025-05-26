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
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth';

interface EmailModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PasswordField {
  value: string;
  visible: boolean;
  error?: string;
}

export function EmailUpdateModal({ visible, onClose }: EmailModalProps) {
  const { colors } = useThemeStore();
  const [currentPassword, setCurrentPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  });
  const [newEmail, setNewEmail] = useState({
    value: '',
    error: '',
  });
  const [confirmEmail, setConfirmEmail] = useState({
    value: '',
    error: '',
  });
  const { updateEmail, loading, error, setError } = useAuthStore();

  const handleEmailChange = (field: 'newEmail' | 'confirmEmail') => {
    return (text: string) => {
      if (field === 'newEmail') {
        setNewEmail({ value: text, error: '' });
      } else {
        setConfirmEmail({ value: text, error: '' });
      }
      setError(null);
    };
  };

  const handlePasswordChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<PasswordField>>) => {
      return (text: string) => {
        setter((prev) => {
          if (prev.value === text) return prev;
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!currentPassword.value) {
      setCurrentPassword((prev) => ({
        ...prev,
        error: 'Le mot de passe est requis',
      }));
      isValid = false;
    }

    if (!newEmail.value) {
      setNewEmail((prev) => ({ ...prev, error: 'Le nouvel email est requis' }));
      isValid = false;
    } else if (!emailRegex.test(newEmail.value)) {
      setNewEmail((prev) => ({
        ...prev,
        error: 'Veuillez entrer un email valide',
      }));
      isValid = false;
    }

    if (!confirmEmail.value) {
      setConfirmEmail((prev) => ({
        ...prev,
        error: "La confirmation de l'email est requise",
      }));
      isValid = false;
    } else if (confirmEmail.value !== newEmail.value) {
      setConfirmEmail((prev) => ({
        ...prev,
        error: 'Les emails ne correspondent pas',
      }));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) return;

    // In your modal's handleSubmit function
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir modifier votre email en ${newEmail.value} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await updateEmail(newEmail.value, currentPassword.value);
              Alert.alert(
                'Email mis à jour',
                'Un lien de confirmation a été envoyé à votre nouvelle adresse email.'
              );
              resetFields();
              onClose();
            } catch (err) {
              if (error?.includes('Mot de passe incorrect')) {
                setCurrentPassword((prev) => ({
                  ...prev,
                  error: 'Mot de passe incorrect',
                }));
              }
            }
          },
        },
      ]
    );
  };

  const resetFields = () => {
    setCurrentPassword({ value: '', visible: false, error: undefined });
    setNewEmail({ value: '', error: '' });
    setConfirmEmail({ value: '', error: '' });
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Modifier l'adresse email
        </Text>

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

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            Nouvel email
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: newEmail.error ? colors.error : colors.border,
              },
            ]}
          >
            <Mail size={20} color={colors.muted} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={newEmail.value}
              onChangeText={handleEmailChange('newEmail')}
              placeholder="Nouvel email"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {newEmail.error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {newEmail.error}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            Confirmer l'email
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: confirmEmail.error ? colors.error : colors.border,
              },
            ]}
          >
            <Mail size={20} color={colors.muted} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={confirmEmail.value}
              onChangeText={handleEmailChange('confirmEmail')}
              placeholder="Confirmer l'email"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {confirmEmail.error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {confirmEmail.error}
              </Text>
            </View>
          )}
        </View>

        <PasswordInput
          label="Mot de passe actuel"
          value={currentPassword.value}
          visible={currentPassword.visible}
          error={currentPassword.error}
          onChangeText={handlePasswordChange(setCurrentPassword)}
          onToggleVisibility={handleToggleVisibility(setCurrentPassword)}
          testID="current-password"
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
              {loading ? 'Envoi en cours...' : 'Modifier'}
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
  icon: {
    marginRight: 8,
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
});
