import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Eye,
  EyeOff,
  CircleAlert as AlertCircle,
  Mail,
  ArrowLeft,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth';
import { Toast, ToastType } from '@/components/Toast';
import { isValidVerificationCode } from '@/lib/supabase';

const CODE_LENGTH = 6;

interface EmailModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PasswordField {
  value: string;
  visible: boolean;
  error?: string;
}

interface EmailField {
  value: string;
  error?: string;
}

export default function EmailUpdate({ visible, onClose }: EmailModalProps) {
  const { colors } = useThemeStore();
  const [currentPassword, setCurrentPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  });
  const [newEmail, setNewEmail] = useState<EmailField>({
    value: '',
    error: '',
  });
  const [confirmEmail, setConfirmEmail] = useState<EmailField>({
    value: '',
    error: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const {
    updateEmailWithVerification,
    loading,
    error,
    setError,
    sendVerificationCodeToAuthenticatedUser,
  } = useAuthStore();

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');

  const hideToast = () => setToastVisible(false);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend && showVerification) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend, showVerification]);

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
        setError(null);
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

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newCode = verificationCode.split('');
    newCode[index] = value;
    const finalCode = newCode.join('');
    setVerificationCode(finalCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Reset errors
    setCurrentPassword((prev) => ({ ...prev, error: undefined }));
    setNewEmail((prev) => ({ ...prev, error: '' }));
    setConfirmEmail((prev) => ({ ...prev, error: '' }));

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

  const handleResendCode = async () => {
    try {
      setCanResend(false);
      setTimer(30);
      await sendVerificationCodeToAuthenticatedUser();
      showToast('success', 'Un nouveau code a été envoyé à votre email.');
    } catch (err) {
      showToast('error', "Échec de l'envoi du code de vérification");
    }
  };

  const handleSendVerificationCode = async () => {
    setError(null);

    if (!validateForm()) {
      showToast('error', 'Veuillez corriger les erreurs avant de soumettre.');
      return;
    }

    try {
      await sendVerificationCodeToAuthenticatedUser();
      setShowVerification(true);
      setTimer(30);
      setCanResend(false);
      showToast(
        'success',
        'Un code de vérification a été envoyé à votre email actuel.'
      );
    } catch (err) {
      const errorMessage = error || "Erreur lors de l'envoi du code";
      if (errorMessage.includes('Mot de passe incorrect')) {
        setCurrentPassword((prev) => ({
          ...prev,
          error: 'Mot de passe incorrect',
        }));
        showToast('error', 'Mot de passe incorrect');
      } else {
        showToast('error', "Échec de l'envoi du code de vérification");
      }
    }
  };

  const handleVerifyAndUpdate = async () => {
    if (!isValidVerificationCode(verificationCode)) {
      showToast('error', 'Veuillez entrer un code de vérification valide');
      return;
    }

    setIsUpdating(true);
    try {
      await updateEmailWithVerification(
        newEmail.value,
        currentPassword.value,
        verificationCode
      );

      showToast('success', 'Votre email a été mis à jour avec succès');

      // Reset form and close modal after successful update
      setTimeout(() => {
        resetFields();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = error || "Erreur lors de la mise à jour de l'email";

      if (errorMessage.includes('Mot de passe incorrect')) {
        setCurrentPassword((prev) => ({
          ...prev,
          error: 'Mot de passe incorrect',
        }));
        showToast('error', 'Mot de passe incorrect');
        setShowVerification(false); // Go back to form
      } else if (errorMessage.includes('Code de vérification incorrect')) {
        showToast('error', 'Code de vérification incorrect');
        setVerificationCode(''); // Clear the code
      } else {
        showToast('error', errorMessage);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const resetFields = () => {
    setCurrentPassword({ value: '', visible: false, error: undefined });
    setNewEmail({ value: '', error: '' });
    setConfirmEmail({ value: '', error: '' });
    setVerificationCode('');
    setShowVerification(false);
    setTimer(30);
    setCanResend(false);
    setIsUpdating(false);
    setError(null);
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={styles.container}>
          {showVerification && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowVerification(false)}
              disabled={isUpdating}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          )}

          <Text style={[styles.title, { color: colors.text }]}>
            {showVerification ? 'Vérifiez votre email' : ''}
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

          {showVerification ? (
            <>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                Nous avons envoyé un code de vérification à votre email actuel.
                Entrez ce code pour confirmer le changement vers{' '}
                {newEmail.value}
              </Text>

              <View style={styles.codeContainer}>
                {[...Array(CODE_LENGTH)].map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => ref && (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                      verificationCode[index]
                        ? { borderColor: colors.primary }
                        : undefined,
                    ]}
                    value={verificationCode[index] || ''}
                    onChangeText={(value) => handleCodeChange(index, value)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handleKeyPress(index, key)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isUpdating}
                  />
                ))}
              </View>

              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: colors.muted }]}>
                  Vous n'avez pas reçu le code ?
                </Text>
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={loading || isUpdating}
                  >
                    <Text
                      style={[
                        styles.resendButton,
                        {
                          color:
                            loading || isUpdating
                              ? colors.muted
                              : colors.primary,
                        },
                      ]}
                    >
                      {loading ? 'Envoi...' : 'Renvoyer le code'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.timerText, { color: colors.muted }]}>
                    Renvoyer dans {timer}s
                  </Text>
                )}
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    (isUpdating || verificationCode.length !== CODE_LENGTH) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleVerifyAndUpdate}
                  disabled={
                    isUpdating || verificationCode.length !== CODE_LENGTH
                  }
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>
                    {isUpdating ? 'Mise à jour...' : 'Confirmer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Nouvel email
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.card,
                      borderColor: newEmail.error
                        ? colors.error
                        : colors.border,
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
                    editable={!loading}
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
                      borderColor: confirmEmail.error
                        ? colors.error
                        : colors.border,
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
                    editable={!loading}
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
                editable={!loading}
              />

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSendVerificationCode}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>
                    {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={onToggleVisibility}
            disabled={!editable}
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: 4,
  },
  resendButton: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  timerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
