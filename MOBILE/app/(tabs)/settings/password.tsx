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
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Eye,
  EyeOff,
  CircleAlert as AlertCircle,
  ArrowLeft,
  Shield,
  Check,
  Lock,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown, FadeIn, SlideInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth';
import { Toast, ToastType } from '@/components/Toast';
import debounce from 'lodash.debounce';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

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
  { id: 'length', label: 'Au moins 8 caractères', icon: '8+' },
  { id: 'uppercase', label: 'Une lettre majuscule', icon: 'A' },
  { id: 'lowercase', label: 'Une lettre minuscule', icon: 'a' },
  { id: 'number', label: 'Un chiffre', icon: '1' },
  { id: 'special', label: 'Un caractère spécial', icon: '#' },
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
    '#EF4444', // Red - Very weak
    '#F97316', // Orange - Weak  
    '#EAB308', // Yellow - Fair
    '#22C55E', // Green - Good
    '#059669', // Dark Green - Strong
  ];

  const strengthLabels = [
    'Très faible',
    'Faible', 
    'Moyen',
    'Bon',
    'Excellent'
  ];

  // Memoized back handler
  const handleBack = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to go back');
    }
  }, []);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <Animated.View entering={SlideInUp.delay(100)} style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Shield size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Modifier votre mot de passe
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Assurez-vous que votre nouveau mot de passe est sécurisé
            </Text>
          </View>
        </Animated.View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Password Inputs */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <PasswordInput
              label="Mot de passe actuel"
              placeholder="Entrez votre mot de passe actuel"
              value={passwords.current.value}
              visible={passwords.current.visible}
              error={passwords.current.error}
              onChangeText={handlePasswordChange('current')}
              onToggleVisibility={handleToggleVisibility('current')}
              testID="current-password"
              editable={!isUpdating && !loading}
              icon={<Lock size={20} color={colors.muted} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <PasswordInput
              label="Nouveau mot de passe"
              placeholder="Créez un nouveau mot de passe"
              value={passwords.new.value}
              visible={passwords.new.visible}
              error={passwords.new.error}
              onChangeText={handlePasswordChange('new')}
              onToggleVisibility={handleToggleVisibility('new')}
              testID="new-password"
              editable={!isUpdating && !loading}
              icon={<Shield size={20} color={colors.muted} />}
              showStrength={true}
              strength={passwordStrength}
              strengthColor={passwordStrength > 0 ? strengthColors[passwordStrength - 1] : colors.muted}
              strengthLabel={passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ''}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <PasswordInput
              label="Confirmer le nouveau mot de passe"
              placeholder="Confirmez votre nouveau mot de passe"
              value={passwords.confirm.value}
              visible={passwords.confirm.visible}
              error={passwords.confirm.error}
              onChangeText={handlePasswordChange('confirm')}
              onToggleVisibility={handleToggleVisibility('confirm')}
              testID="confirm-password"
              editable={!isUpdating && !loading}
              icon={<Check size={20} color={colors.muted} />}
            />
          </Animated.View>

          {/* Requirements Section */}
          <Animated.View entering={FadeInDown.delay(500)} style={[styles.requirementsCard, { backgroundColor: colors.card }]}>
            <View style={styles.requirementsHeader}>
              <View style={[styles.requirementsIcon, { backgroundColor: colors.primary + '15' }]}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={[styles.requirementsTitle, { color: colors.text }]}>
                Exigences du mot de passe
              </Text>
            </View>
            
            <View style={styles.requirementsList}>
              {passwordRequirements.map((req, index) => {
                const isMet = checkPasswordRequirement(req.id, passwords.new.value);
                return (
                  <Animated.View 
                    key={req.id} 
                    entering={FadeInDown.delay(600 + index * 50)}
                    style={styles.requirementItem}
                  >
                    <View style={[
                      styles.requirementIndicator, 
                      { backgroundColor: isMet ? colors.success : colors.border }
                    ]}>
                      {isMet ? (
                        <Check size={14} color="white" />
                      ) : (
                        <Text style={[styles.requirementIconText, { color: colors.muted }]}>
                          {req.icon}
                        </Text>
                      )}
                    </View>
                    <Text style={[
                      styles.requirementText,
                      { color: isMet ? colors.success : colors.text }
                    ]}>
                      {req.label}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>

            {/* Overall Progress */}
            {passwords.new.value && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.text }]}>
                    Force du mot de passe
                  </Text>
                  <Text style={[styles.progressText, { 
                    color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : colors.muted 
                  }]}>
                    {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Faible'}
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : colors.muted,
                        width: `${(passwordStrength / 5) * 100}%`
                      }
                    ]}
                    entering={FadeIn.duration(300)}
                  />
                </View>
              </View>
            )}
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(700)} style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { 
                  backgroundColor: isFormValid ? colors.primary : colors.border,
                  shadowColor: colors.primary
                },
                (!isFormValid || isUpdating || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isUpdating || loading}
              activeOpacity={0.8}
              accessibilityLabel="Confirmer la modification du mot de passe"
            >
              <View style={styles.submitButtonContent}>
                {isUpdating ? (
                  <>
                    <View style={styles.loadingSpinner} />
                    <Text style={[styles.submitButtonText, { 
                      color: isFormValid ? 'white' : colors.muted 
                    }]}>
                      Modification en cours...
                    </Text>
                  </>
                ) : (
                  <>
                    <Shield size={20} color={isFormValid ? 'white' : colors.muted} />
                    <Text style={[styles.submitButtonText, { 
                      color: isFormValid ? 'white' : colors.muted 
                    }]}>
                      Modifier le mot de passe
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
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
    placeholder,
    value,
    visible,
    error,
    onChangeText,
    onToggleVisibility,
    testID,
    editable = true,
    icon,
    showStrength = false,
    strength = 0,
    strengthColor,
    strengthLabel,
  }: {
    label: string;
    placeholder?: string;
    value: string;
    visible: boolean;
    error?: string;
    onChangeText: (text: string) => void;
    onToggleVisibility: () => void;
    testID: string;
    editable?: boolean;
    icon?: React.ReactNode;
    showStrength?: boolean;
    strength?: number;
    strengthColor?: string;
    strengthLabel?: string;
  }) => {
    const { colors } = useThemeStore();

    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.card,
              borderColor: error ? colors.error : value ? colors.primary + '40' : colors.border,
              borderWidth: error ? 2 : value ? 1.5 : 1,
            },
          ]}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <TextInput
            style={[styles.textInput, { color: colors.text, flex: 1 }]}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!visible}
            placeholder={placeholder}
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
            style={styles.visibilityButton}
            onPress={onToggleVisibility}
            disabled={!editable}
            activeOpacity={0.7}
            accessibilityLabel={
              visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
          >
            {visible ? (
              <EyeOff size={20} color={colors.muted} />
            ) : (
              <Eye size={20} color={colors.muted} />
            )}
          </TouchableOpacity>
        </View>
        
        {showStrength && value && strengthLabel && (
          <View style={styles.strengthIndicator}>
            <Text style={[styles.strengthText, { color: strengthColor }]}>
              {strengthLabel}
            </Text>
          </View>
        )}
        
        {error && (
          <Animated.View entering={FadeInDown} style={styles.errorContainer}>
            <AlertCircle size={16} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: 16,
    minHeight: 56,
  },
  visibilityButton: {
    padding: 12,
    marginLeft: 8,
  },
  strengthIndicator: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  strengthText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
  },
  requirementsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  requirementsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  requirementsList: {
    marginBottom: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  requirementIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  requirementIconText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  requirementText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  buttonContainer: {
    marginTop: 8,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.05,
    elevation: 2,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    marginRight: 8,
  },
});