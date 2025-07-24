import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { isValidVerificationCode } from '@/lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Toast, ToastType } from '@/components/Toast';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const { colors } = useThemeStore();
  const { verifyEmail, resendVerificationCode, loading, error } =
    useAuthStore();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

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
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newCode = code.split('');
    newCode[index] = value;
    const finalCode = newCode.join('');
    setCode(finalCode);

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    try {
      setCanResend(false);
      setTimer(30);
      await resendVerificationCode();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleVerify = async () => {
    if (!isValidVerificationCode(code)) {
      return;
    }

    try {
      await verifyEmail(code);

      setTimeout(() => {
        if (!error) {
          showToast('success', 'Email vérifié avec succès');

          router.replace('/upload-documents');
        }
      }, 1000);
    } catch (err) {
      showToast('error', "Erreur lors de la vérification de l'email");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={() => router.push('/(auth)/register')}
      >
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Vérifiez votre email
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Nous avons envoyé un code de vérification à votre adresse email
          </Text>
        </View>

        <View style={styles.progress}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: '50%' },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            Étape 2 sur 4
          </Text>
        </View>

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
                code[index] ? { borderColor: colors.primary } : undefined,
              ]}
              value={code[index] || ''}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent: { key } }) =>
                handleKeyPress(index, key)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: colors.primary },
            (loading || code.length !== CODE_LENGTH) && styles.buttonDisabled,
          ]}
          onPress={handleVerify}
          disabled={loading || code.length !== CODE_LENGTH}
        >
          <Text style={[styles.verifyButtonText, { color: colors.card }]}>
            {loading ? 'Vérification...' : 'Vérifier Email'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.muted }]}>
            Vous n'avez pas reçu le code ?
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={[styles.resendButton, { color: colors.primary }]}>
                Renvoyer le code
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.timerText, { color: colors.muted }]}>
              Renvoyer dans {timer}s
            </Text>
          )}
        </View>

        <View style={styles.helpContainer}>
          <Mail size={20} color={colors.muted} />
          <Text style={[styles.helpText, { color: colors.muted }]}>
            Vérifiez votre dossier spam si vous ne voyez pas l'email dans votre
            boîte de réception
          </Text>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 48,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  progress: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
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
  verifyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  helpText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});
