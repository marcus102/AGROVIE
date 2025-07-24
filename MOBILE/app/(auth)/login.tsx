import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Toast, ToastType } from '@/components/Toast';

// Get initial screen dimensions
const { width: initialWidth, height: initialHeight } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  small: 320,
  medium: 768,
  large: 1024,
  xlarge: 1200,
};

// Responsive helper functions
const getResponsiveValue = (width: number, small: number, medium?: number, large?: number) => {
  if (width >= BREAKPOINTS.large && large !== undefined) return large;
  if (width >= BREAKPOINTS.medium && medium !== undefined) return medium;
  return small;
};

const isTablet = (width: number, height: number) => {
  return Math.min(width, height) >= BREAKPOINTS.medium;
};

const isLandscape = (width: number, height: number) => {
  return width > height;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight });
  
  const { signIn, loading, error } = useAuthStore();
  const { colors } = useThemeStore();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const hideToast = () => setToastVisible(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Veuillez remplir tous les champs.');
      return;
    }

    if (!validateEmail(email)) {
      showToast('error', 'Adresse e-mail invalide.');
      setEmail('');
      return;
    }

    try {
      await signIn(email, password);

      setTimeout(() => {
        if (!error) {
          showToast('success', 'Connexion réussie');
          setTimeout(() => {
            router.replace('/');
          }, 500);
        } else {
          showToast('error', error);
        }
      }, 500);
    } catch (err) {
      if (__DEV__) {
        console.error('Login error:', err);
      }
      showToast(
        'error',
        'Échec de la connexion. Veuillez vérifier vos identifiants.'
      );
    }
  };

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  // Calculate responsive styles
  const { width, height } = dimensions;
  const tablet = isTablet(width, height);
  const landscape = isLandscape(width, height);

  const responsiveStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: getResponsiveValue(width, 16, 24, 32),
      justifyContent: tablet ? 'center' : 'flex-start',
      paddingTop: tablet ? getResponsiveValue(width, 40, 60, 80) : 40,
    },
    contentLandscape: {
      paddingTop: 20,
    },
    header: {
      marginBottom: getResponsiveValue(width, 32, 48, 64),
      alignItems: 'center',
    },
    title: {
      fontFamily: 'Inter-Bold',
      fontSize: getResponsiveValue(width, 28, 36, 48),
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveValue(width, 14, 16, 18),
      color: '#e5e7eb',
      textAlign: 'center',
      paddingHorizontal: getResponsiveValue(width, 16, 32, 48),
    },
    form: {
      backgroundColor: colors.card,
      borderRadius: getResponsiveValue(width, 12, 16, 20),
      padding: getResponsiveValue(width, 20, 24, 32),
      marginHorizontal: tablet ? width * 0.1 : 0,
      maxWidth: tablet ? 500 : '100%',
      alignSelf: 'center',
      width: tablet ? '80%' : '100%',
      ...Platform.select({
        web: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        default: {
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }),
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: getResponsiveValue(width, 8, 10, 12),
      paddingHorizontal: getResponsiveValue(width, 12, 16, 20),
      marginBottom: getResponsiveValue(width, 12, 16, 20),
      backgroundColor: colors.card,
      borderColor: colors.border,
      minHeight: getResponsiveValue(width, 48, 52, 56),
    },
    input: {
      flex: 1,
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveValue(width, 14, 16, 18),
      color: colors.text,
      paddingVertical: getResponsiveValue(width, 12, 14, 16),
      marginLeft: 8,
    },
    eyeButton: {
      padding: getResponsiveValue(width, 6, 8, 10),
    },
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: getResponsiveValue(width, 20, 24, 28),
    },
    forgotText: {
      fontFamily: 'Inter-Medium',
      fontSize: getResponsiveValue(width, 12, 14, 16),
      color: colors.primary,
    },
    loginButton: {
      backgroundColor: '#166534',
      paddingVertical: getResponsiveValue(width, 12, 14, 16),
      borderRadius: getResponsiveValue(width, 8, 10, 12),
      alignItems: 'center',
      minHeight: getResponsiveValue(width, 48, 52, 56),
      justifyContent: 'center',
    },
    loginButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: getResponsiveValue(width, 14, 16, 18),
      color: '#ffffff',
    },
    signupContainer: {
      flexDirection: tablet && !landscape ? 'row' : 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: getResponsiveValue(width, 20, 24, 28),
      gap: tablet && !landscape ? 4 : 8,
    },
    signupText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveValue(width, 12, 14, 16),
      color: colors.muted,
      textAlign: 'center',
    },
    signupLink: {
      fontFamily: 'Inter-SemiBold',
      fontSize: getResponsiveValue(width, 12, 14, 16),
      color: colors.primary,
      textAlign: 'center',
    },
    contactSection: {
      marginTop: getResponsiveValue(width, 24, 32, 40),
      padding: getResponsiveValue(width, 16, 20, 24),
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    contactTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: getResponsiveValue(width, 16, 18, 20),
      marginBottom: 8,
      textAlign: 'center',
      color: colors.text,
    },
    contactText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveValue(width, 12, 14, 16),
      textAlign: 'center',
      marginBottom: getResponsiveValue(width, 12, 16, 20),
      color: colors.muted,
    },
    contactInfo: {
      gap: getResponsiveValue(width, 8, 12, 16),
    },
    contactItem: {
      flexDirection: tablet ? 'row' : 'column',
      justifyContent: tablet ? 'space-between' : 'center',
      alignItems: 'center',
      gap: tablet ? 0 : 4,
    },
    contactLabel: {
      fontFamily: 'Inter-Medium',
      fontSize: getResponsiveValue(width, 12, 14, 16),
      color: colors.text,
    },
    contactValue: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveValue(width, 12, 14, 16),
      color: colors.primary,
    },
  });

  const ContentComponent = tablet && landscape ? ScrollView : View;
  const contentProps = tablet && landscape ? { 
    contentContainerStyle: { flexGrow: 1 },
    showsVerticalScrollIndicator: false 
  } : { style: { flex: 1 } };

  return (
    <>
      <KeyboardAvoidingView style={responsiveStyles.container}>
        <Image
          source={require('../../assets/loginImg.jpg')}
          blurRadius={3}
          style={styles.backgroundImage}
        />

        <View style={styles.overlay} />

        <ContentComponent {...contentProps}>
          <View style={[
            responsiveStyles.content,
            landscape && responsiveStyles.contentLandscape
          ]}>
            <Animated.View entering={FadeInDown.delay(200)} style={responsiveStyles.header}>
              <Text style={responsiveStyles.title}>Bienvenue à nouveau</Text>
              <Text style={responsiveStyles.subtitle}>
                Connectez-vous pour continuer vers votre compte
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400)}
              style={responsiveStyles.form}
            >
              <View style={responsiveStyles.inputContainer}>
                <Mail size={getResponsiveValue(width, 18, 20, 22)} color={colors.muted} />
                <TextInput
                  style={responsiveStyles.input}
                  placeholder="Adresse e-mail"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={responsiveStyles.inputContainer}>
                <Lock size={getResponsiveValue(width, 18, 20, 22)} color={colors.muted} />
                <TextInput
                  style={responsiveStyles.input}
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={responsiveStyles.eyeButton}
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  accessibilityRole="button"
                >
                  {showPassword ? (
                    <EyeOff size={getResponsiveValue(width, 18, 20, 22)} color={colors.muted} />
                  ) : (
                    <Eye size={getResponsiveValue(width, 18, 20, 22)} color={colors.muted} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={responsiveStyles.optionsContainer}>
                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                  <Text style={responsiveStyles.forgotText}>
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  responsiveStyles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={responsiveStyles.loginButtonText}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Text>
              </TouchableOpacity>

              <View style={responsiveStyles.signupContainer}>
                <Text style={responsiveStyles.signupText}>
                  Vous n'avez pas de compte ?
                </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={responsiveStyles.signupLink}>
                    S'inscrire
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Contact Information Section */}
              <View style={responsiveStyles.contactSection}>
                <Text style={responsiveStyles.contactTitle}>
                  Besoin d'aide ?
                </Text>
                <Text style={responsiveStyles.contactText}>
                  Notre équipe support est là pour vous aider
                </Text>

                <View style={responsiveStyles.contactInfo}>
                  <View style={responsiveStyles.contactItem}>
                    <Text style={responsiveStyles.contactLabel}>
                      Email:
                    </Text>
                    <Text style={responsiveStyles.contactValue}>
                      support@agrrick.com
                    </Text>
                  </View>

                  <View style={responsiveStyles.contactItem}>
                    <Text style={responsiveStyles.contactLabel}>
                      Téléphone:
                    </Text>
                    <Text style={responsiveStyles.contactValue}>
                      +226 74 18 97 63
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </ContentComponent>
      </KeyboardAvoidingView>
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

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});