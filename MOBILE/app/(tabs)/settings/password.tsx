import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth';
import { Toast, ToastType } from '@/components/Toast';
import debounce from 'lodash.debounce';
import { router } from 'expo-router';

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PasswordField {
  value: string;
  visible: boolean;
  error?: string;
}

interface PasswordState {
  current: PasswordField;
  new: PasswordField;
  confirm: PasswordField;
}

const passwordRequirements = [
  { id: 'length', label: 'Au moins 8 caractères' },
  { id: 'uppercase', label: 'Une lettre majuscule' },
  { id: 'lowercase', label: 'Une lettre minuscule' },
  { id: 'number', label: 'Un chiffre' },
  { id: 'special', label: 'Un caractère spécial' },
] as const;

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

// Helper function to check if error is related to current password
const isCurrentPasswordError = (error: string): boolean => {
  const lowerError = error.toLowerCase();
  return (
    lowerError.includes('mot de passe incorrect') ||
    lowerError.includes('current password') ||
    lowerError.includes('invalid password') ||
    lowerError.includes('wrong password') ||
    lowerError.includes('incorrect password')
  );
};

// Helper function to check if error is related to password requirements
const isPasswordRequirementError = (error: string): boolean => {
  const lowerError = error.toLowerCase();
  return (
    lowerError.includes('weak password') ||
    lowerError.includes('password requirements') ||
    lowerError.includes('password strength')
  );
};

// Helper function to check if error is network related
const isNetworkError = (error: string): boolean => {
  const lowerError = error.toLowerCase();
  return (
    lowerError.includes('network') ||
    lowerError.includes('timeout') ||
    lowerError.includes('connexion') ||
    lowerError.includes('connection')
  );
};

export default function PasswordUpdate({
  visible,
  onClose,
}: PasswordModalProps) {
  const { colors } = useThemeStore();

  // Initialize password state
  const [passwords, setPasswords] = useState<PasswordState>({
    current: { value: '', visible: false, error: '' },
    new: { value: '', visible: false, error: '' },
    confirm: { value: '', visible: false, error: '' },
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [operationSuccess, setOperationSuccess] = useState(false);

  const { resetPassword, loading, error } = useAuthStore();

  // Refs to track component state and prevent state updates after unmount
  const isMountedRef = useRef(true);
  const pendingOperationsRef = useRef<Set<Promise<any>>>(new Set());

  // Initialize component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel all pending operations
      pendingOperationsRef.current.clear();
    };
  }, []);

  // Reset component state when modal becomes visible
  useEffect(() => {
    if (visible) {
      resetFields();
    }
  }, [visible]);

  const hideToast = useCallback(() => {
    if (isMountedRef.current) {
      setToastVisible(false);
    }
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    if (isMountedRef.current) {
      setToastType(type);
      setToastMessage(message);
      setToastVisible(true);
    }
  }, []);

  // Debounced password strength calculation with proper cleanup
  const calculatePasswordStrength = useMemo(
    () =>
      debounce((password: string) => {
        if (!isMountedRef.current) return;

        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (SPECIAL_CHAR_REGEX.test(password)) strength += 1;
        setPasswordStrength(strength);
      }, 300),
    []
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      calculatePasswordStrength.cancel();
    };
  }, [calculatePasswordStrength]);

  const handlePasswordChange = useCallback(
    (field: keyof PasswordState) => (text: string) => {
      if (!isMountedRef.current) return;

      setPasswords((prev) => {
        const updated = {
          ...prev,
          [field]: { ...prev[field], value: text, error: '' },
        };

        if (field === 'new') {
          calculatePasswordStrength(text);
        }

        return updated;
      });
    },
    [calculatePasswordStrength]
  );

  const handleToggleVisibility = useCallback(
    (field: keyof PasswordState) => () => {
      if (!isMountedRef.current) return;

      setPasswords((prev) => ({
        ...prev,
        [field]: { ...prev[field], visible: !prev[field].visible },
      }));
    },
    []
  );

  const checkPasswordRequirement = useCallback(
    (requirement: string, password: string): boolean => {
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
          return SPECIAL_CHAR_REGEX.test(password);
        default:
          return false;
      }
    },
    []
  );

  const requirementsMet = useMemo(
    () =>
      passwordRequirements.every((req) =>
        checkPasswordRequirement(req.id, passwords.new.value)
      ),
    [passwords.new.value, checkPasswordRequirement]
  );

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors: Record<keyof PasswordState, string> = {
      current: '',
      new: '',
      confirm: '',
    };

    if (!passwords.current.value.trim()) {
      newErrors.current = 'Le mot de passe actuel est requis';
      isValid = false;
    }

    if (!passwords.new.value.trim()) {
      newErrors.new = 'Le nouveau mot de passe est requis';
      isValid = false;
    } else if (!requirementsMet) {
      newErrors.new = 'Le mot de passe ne respecte pas tous les critères';
      isValid = false;
    }

    if (!passwords.confirm.value.trim()) {
      newErrors.confirm = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (passwords.confirm.value !== passwords.new.value) {
      newErrors.confirm = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    if (isMountedRef.current) {
      setPasswords((prev) => ({
        current: { ...prev.current, error: newErrors.current },
        new: { ...prev.new, error: newErrors.new },
        confirm: { ...prev.confirm, error: newErrors.confirm },
      }));
    }

    return isValid;
  }, [passwords, requirementsMet]);

  const resetFields = useCallback(() => {
    if (!isMountedRef.current) return;

    setPasswords({
      current: { value: '', visible: false, error: '' },
      new: { value: '', visible: false, error: '' },
      confirm: { value: '', visible: false, error: '' },
    });
    setPasswordStrength(0);
    setIsUpdating(false);
    setOperationSuccess(false);
  }, []);

  const handlePasswordUpdateError = useCallback(
    (errorMessage: string) => {
      if (!isMountedRef.current) return;

      if (isCurrentPasswordError(errorMessage)) {
        setPasswords((prev) => ({
          ...prev,
          current: {
            ...prev.current,
            error: 'Mot de passe actuel incorrect',
          },
        }));
        showToast('error', 'Mot de passe actuel incorrect');
      } else if (isPasswordRequirementError(errorMessage)) {
        setPasswords((prev) => ({
          ...prev,
          new: {
            ...prev.new,
            error: 'Le mot de passe ne respecte pas les critères',
          },
        }));
        showToast(
          'error',
          'Le nouveau mot de passe ne respecte pas les critères'
        );
      } else if (isNetworkError(errorMessage)) {
        showToast('error', 'Erreur de connexion. Veuillez réessayer.');
      } else {
        showToast('error', errorMessage);
      }
    },
    [showToast]
  );

  const handleSubmit = useCallback(async () => {
    if (!isMountedRef.current) return;

    // Clear previous states
    setOperationSuccess(false);

    if (!validateForm()) {
      showToast('error', 'Veuillez corriger les erreurs avant de soumettre.');
      return;
    }

    const submitOperation = async () => {
      try {
        if (!isMountedRef.current) return;
        setIsUpdating(true);

        // Call the resetPassword function and wait for it to complete

        console.log(
          '🔒 Submitting password reset operation...',
          passwords.current.value
        );
        await resetPassword(passwords.new.value, passwords.current.value);

        // Wait a bit to ensure any error state propagation is complete
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!isMountedRef.current) return;

        // Check for errors after the operation
        const currentError = error;

        if (currentError) {
          // Handle the error - do NOT redirect to login
          handlePasswordUpdateError(currentError);

          if (__DEV__) {
            console.log('Operation failed with error:', currentError);
          }
          return;
        }

        // Only if there's no error, consider it successful
        setOperationSuccess(true);
        showToast('success', 'Votre mot de passe a été modifié avec succès.');

        // Auto-hide passwords after success
        setTimeout(() => {
          if (isMountedRef.current) {
            setPasswords((prev) => ({
              ...prev,
              new: { ...prev.new, visible: false },
              confirm: { ...prev.confirm, visible: false },
            }));
          }
        }, 2000);

        // Wait a bit to show success message, then redirect and close
        setTimeout(() => {
          if (isMountedRef.current) {
            // Only redirect to login on successful password change
            router.replace('/(auth)/login');
            resetFields();
          }
        }, 2500);
      } catch (err) {
        console.error('Password reset operation failed with exception:', err);

        if (!isMountedRef.current) return;

        // Wait a bit more for any error state to propagate
        await new Promise((resolve) => setTimeout(resolve, 300));

        let errorMessage = 'Une erreur est survenue';

        // Check if the error state was updated
        if (error) {
          errorMessage = error;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        if (__DEV__) {
          console.log('Final error message:', errorMessage);
        }

        // Handle the error - do NOT redirect to login
        handlePasswordUpdateError(errorMessage);

        // Do not close the modal on error
        if (__DEV__) {
          console.log('Modal will remain open due to error');
        }
      } finally {
        if (isMountedRef.current) {
          setIsUpdating(false);
        }
      }
    };

    const promise = submitOperation();
    pendingOperationsRef.current.add(promise);

    promise.finally(() => {
      pendingOperationsRef.current.delete(promise);
    });
  }, [
    passwords,
    validateForm,
    resetPassword,
    error,
    showToast,
    resetFields,
    onClose,
    handlePasswordUpdateError,
  ]);

  const isFormValid = useMemo(
    () =>
      passwords.current.value.trim() &&
      passwords.new.value.trim() &&
      passwords.confirm.value.trim() &&
      requirementsMet &&
      passwords.new.value === passwords.confirm.value,
    [passwords, requirementsMet]
  );

  const strengthColors = [
    colors.error,
    colors.error,
    colors.warning,
    colors.success,
    colors.success,
  ];

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={styles.container}>
          <PasswordInput
            label="Mot de passe actuel"
            value={passwords.current.value}
            visible={passwords.current.visible}
            error={passwords.current.error}
            onChangeText={handlePasswordChange('current')}
            onToggleVisibility={handleToggleVisibility('current')}
            testID="current-password"
            editable={!isUpdating && !loading}
          />

          <PasswordInput
            label="Nouveau mot de passe"
            value={passwords.new.value}
            visible={passwords.new.visible}
            error={passwords.new.error}
            onChangeText={handlePasswordChange('new')}
            onToggleVisibility={handleToggleVisibility('new')}
            testID="new-password"
            editable={!isUpdating && !loading}
          />

          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            value={passwords.confirm.value}
            visible={passwords.confirm.visible}
            error={passwords.confirm.error}
            onChangeText={handlePasswordChange('confirm')}
            onToggleVisibility={handleToggleVisibility('confirm')}
            testID="confirm-password"
            editable={!isUpdating && !loading}
          />

          <View style={styles.requirementsContainer}>
            <Text style={[styles.requirementsTitle, { color: colors.text }]}>
              Le mot de passe doit contenir :
            </Text>
            {passwordRequirements.map((req) => (
              <View key={req.id} style={styles.requirementItem}>
                <View
                  style={[
                    styles.requirementBullet,
                    {
                      backgroundColor: checkPasswordRequirement(
                        req.id,
                        passwords.new.value
                      )
                        ? colors.success
                        : colors.muted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.requirement,
                    {
                      color: checkPasswordRequirement(
                        req.id,
                        passwords.new.value
                      )
                        ? colors.success
                        : colors.text,
                    },
                  ]}
                >
                  {req.label}
                </Text>
              </View>
            ))}

            {/* Password Strength Meter */}
            {passwords.new.value && (
              <View style={styles.strengthContainer}>
                <Text style={[styles.strengthLabel, { color: colors.text }]}>
                  Force du mot de passe:
                </Text>
                <View style={styles.strengthMeter}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        i <= passwordStrength && {
                          backgroundColor: strengthColors[passwordStrength - 1],
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: colors.primary },
                (!isFormValid || isUpdating || loading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isUpdating || loading}
              accessibilityLabel="Confirmer la modification du mot de passe"
            >
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                {isUpdating ? 'Modification...' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />
    </>
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
    editable = true,
  }: {
    label: string;
    value: string;
    visible: boolean;
    error?: string;
    onChangeText: (text: string) => void;
    onToggleVisibility: () => void;
    testID: string;
    editable?: boolean;
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
            editable={editable}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType={
              label.includes('actuel') ? 'password' : 'newPassword'
            }
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={onToggleVisibility}
            disabled={!editable}
            accessibilityLabel={
              visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
            accessibilityHint="Basculer la visibilité du mot de passe"
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
  requirementsContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  requirementsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  requirement: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  strengthContainer: {
    marginTop: 16,
  },
  strengthLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  strengthMeter: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    backgroundColor: '#e5e7eb',
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
});
