import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {
  Eye,
  EyeOff,
  CircleAlert as AlertCircle,
  Mail,
  ArrowLeft,
  Shield,
  Check,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth';
import { Toast, ToastType } from '@/components/Toast';
import { isValidVerificationCode } from '@/lib/supabase';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
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

  // Animation values
  const headerOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);

  const hideToast = () => setToastVisible(false);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  useEffect(() => {
    let interval: any;
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

  // Memoized back handler
  const handleBack = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to go back');
    }
  }, []);

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

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(headerOpacity.value, { duration: 300 }),
      transform: [
        { translateY: withTiming(formTranslateY.value, { duration: 300 }) }
      ],
    };
  });

  return (
    <>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* Header with gradient background */}
        <Animated.View
          style={[
            styles.headerContainer,
            { backgroundColor: colors.primary },
            animatedHeaderStyle
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[styles.backButton]}
              onPress={showVerification ? () => setShowVerification(false) : handleBack}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Animated.View
                entering={FadeInUp.delay(200)}
                style={styles.iconContainer}
              >
                {showVerification ? (
                  <Shield size={32} color="#ffffff" />
                ) : (
                  <Mail size={32} color="#ffffff" />
                )}
              </Animated.View>

              <Animated.Text
                entering={FadeInUp.delay(300)}
                style={styles.headerTitle}
              >
                {showVerification ? 'Vérifiez votre email' : 'Modifier l\'email'}
              </Animated.Text>

              <Animated.Text
                entering={FadeInUp.delay(400)}
                style={styles.headerSubtitle}
              >
                {showVerification
                  ? 'Entrez le code de vérification reçu par email'
                  : 'Mettez à jour votre adresse email en toute sécurité'
                }
              </Animated.Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Content */}
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(500)}
            style={styles.formCard}
          >
            {error && (
              <Animated.View
                entering={SlideInLeft}
                style={[
                  styles.globalError,
                  { backgroundColor: colors.error + '15', borderColor: colors.error + '30' },
                ]}
              >
                <AlertCircle size={20} color={colors.error} />
                <Text style={[styles.globalErrorText, { color: colors.error }]}>
                  {error}
                </Text>
              </Animated.View>
            )}

            {showVerification ? (
              <VerificationSection
                verificationCode={verificationCode}
                newEmail={newEmail.value}
                isUpdating={isUpdating}
                loading={loading}
                timer={timer}
                canResend={canResend}
                inputRefs={inputRefs}
                onCodeChange={handleCodeChange}
                onKeyPress={handleKeyPress}
                onResendCode={handleResendCode}
                onVerifyAndUpdate={handleVerifyAndUpdate}
                colors={colors}
              />
            ) : (
              <EmailFormSection
                newEmail={newEmail}
                confirmEmail={confirmEmail}
                currentPassword={currentPassword}
                loading={loading}
                onEmailChange={handleEmailChange}
                onPasswordChange={handlePasswordChange(setCurrentPassword)}
                onToggleVisibility={handleToggleVisibility(setCurrentPassword)}
                onSubmit={handleSendVerificationCode}
                colors={colors}
              />
            )}
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

// Verification Section Component
const VerificationSection = ({
  verificationCode,
  newEmail,
  isUpdating,
  loading,
  timer,
  canResend,
  inputRefs,
  onCodeChange,
  onKeyPress,
  onResendCode,
  onVerifyAndUpdate,
  colors,
}: any) => (
  <>
    <Animated.View entering={FadeInDown.delay(100)} style={styles.infoCard}>
      <Text style={[styles.infoText, { color: colors.text }]}>
        Nous avons envoyé un code de vérification à votre email actuel.
      </Text>
      <Text style={[styles.emailHighlight, { color: colors.primary }]}>
        {newEmail}
      </Text>
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(200)} style={styles.codeContainer}>
      {[...Array(CODE_LENGTH)].map((_, index) => (
        <Animated.View
          key={index}
          entering={FadeInDown.delay(300 + index * 50)}
        >
          <TextInput
            ref={(ref) => {
              if (ref) {
                inputRefs.current[index] = ref;
              }
            }}
            style={[
              styles.codeInput,
              {
                backgroundColor: colors.card,
                borderColor: verificationCode[index] ? colors.primary : colors.border,
                color: colors.text,
              },
              verificationCode[index] && {
                borderWidth: 2,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
            value={verificationCode[index] || ''}
            onChangeText={(value) => onCodeChange(index, value)}
            onKeyPress={({ nativeEvent: { key } }) =>
              onKeyPress(index, key)
            }
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!isUpdating}
          />
        </Animated.View>
      ))}
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(600)} style={styles.resendContainer}>
      <Text style={[styles.resendText, { color: colors.muted }]}>
        Vous n'avez pas reçu le code ?
      </Text>
      {canResend ? (
        <TouchableOpacity
          onPress={onResendCode}
          disabled={loading || isUpdating}
          style={styles.resendButton}
        >
          <Text
            style={[
              styles.resendButtonText,
              {
                color: loading || isUpdating ? colors.muted : colors.primary,
              },
            ]}
          >
            {loading ? 'Envoi...' : 'Renvoyer le code'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: colors.muted }]}>
            Renvoyer dans {timer}s
          </Text>
        </View>
      )}
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(700)} style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary },
          (isUpdating || verificationCode.length !== CODE_LENGTH) &&
          styles.buttonDisabled,
        ]}
        onPress={onVerifyAndUpdate}
        disabled={isUpdating || verificationCode.length !== CODE_LENGTH}
      >
        {isUpdating && <ActivityIndicator size="small" color="#ffffff" style={styles.buttonIcon} />}
        <Text style={styles.primaryButtonText}>
          {isUpdating ? 'Mise à jour...' : 'Confirmer'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  </>
);

// Email Form Section Component
const EmailFormSection = ({
  newEmail,
  confirmEmail,
  currentPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onToggleVisibility,
  onSubmit,
  colors,
}: any) => (
  <>
    <Animated.View entering={FadeInDown.delay(100)} style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Nouvelle adresse email
      </Text>

      <ModernInput
        label="Nouvel email"
        value={newEmail.value}
        onChangeText={onEmailChange('newEmail')}
        placeholder="Entrez votre nouvel email"
        keyboardType="email-address"
        autoCapitalize="none"
        icon={<Mail size={20} color={colors.muted} />}
        error={newEmail.error}
        editable={!loading}
        colors={colors}
        delay={200}
      />

      <ModernInput
        label="Confirmer l'email"
        value={confirmEmail.value}
        onChangeText={onEmailChange('confirmEmail')}
        placeholder="Confirmez votre nouvel email"
        keyboardType="email-address"
        autoCapitalize="none"
        icon={<Mail size={20} color={colors.muted} />}
        error={confirmEmail.error}
        editable={!loading}
        colors={colors}
        delay={300}
      />
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(400)} style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Confirmation de sécurité
      </Text>

      <ModernPasswordInput
        label="Mot de passe actuel"
        value={currentPassword.value}
        visible={currentPassword.visible}
        error={currentPassword.error}
        onChangeText={onPasswordChange}
        onToggleVisibility={onToggleVisibility}
        editable={!loading}
        colors={colors}
        delay={500}
      />
    </Animated.View>

    <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary },
          loading && styles.buttonDisabled,
        ]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading && <ActivityIndicator size="small" color="#ffffff" style={styles.buttonIcon} />}
        <Text style={styles.primaryButtonText}>
          {loading ? 'Envoi en cours...' : 'Envoyer le code'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  </>
);

// Modern Input Component
const ModernInput = React.memo(({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  icon,
  error,
  editable = true,
  colors,
  delay = 0,
}: any) => (
  <Animated.View entering={FadeInDown.delay(delay)} style={styles.inputGroup}>
    <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
    <View
      style={[
        styles.modernInputWrapper,
        {
          backgroundColor: colors.card,
          borderColor: error ? colors.error : colors.border,
        },
        error && { borderWidth: 1.5 },
      ]}
    >
      {icon && <View style={styles.inputIconContainer}>{icon}</View>}
      <TextInput
        style={[styles.modernInput, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
    {error && (
      <Animated.View entering={SlideInLeft} style={styles.errorContainer}>
        <AlertCircle size={14} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      </Animated.View>
    )}
  </Animated.View>
));

// Modern Password Input Component
const ModernPasswordInput = React.memo(({
  label,
  value,
  visible,
  error,
  onChangeText,
  onToggleVisibility,
  editable = true,
  colors,
  delay = 0,
}: any) => (
  <Animated.View entering={FadeInDown.delay(delay)} style={styles.inputGroup}>
    <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
    <View
      style={[
        styles.modernInputWrapper,
        {
          backgroundColor: colors.card,
          borderColor: error ? colors.error : colors.border,
        },
        error && { borderWidth: 1.5 },
      ]}
    >
      <TextInput
        style={[styles.modernInput, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        placeholder="Entrez votre mot de passe actuel"
        placeholderTextColor={colors.muted}
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
      <Animated.View entering={SlideInLeft} style={styles.errorContainer}>
        <AlertCircle size={14} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      </Animated.View>
    )}
  </Animated.View>
));

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    marginTop: -12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: 'transparent',
    paddingTop: 24,
  },
  globalError: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  globalErrorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  // Verification Section Styles
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emailHighlight: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  codeInput: {
    width: (width - 80) / 6,
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 6,
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  timerContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 16,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  // Form Section Styles
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  modernInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputIconContainer: {
    marginRight: 12,
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: 16,
  },
  visibilityToggle: {
    padding: 8,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  // Button Styles
  buttonContainer: {
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});