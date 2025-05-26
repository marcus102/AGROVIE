import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  ChevronRight,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';

const roles = [
  {
    id: 'worker',
    label: 'Travailleur',
    description: 'Trouver des opportunités de travail',
  },
  {
    id: 'technician',
    label: 'Technicien',
    description: 'Offrez des services techniques',
  },
  {
    id: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'Gérez une entreprise agricole',
  },
];

const passwordRequirements = [
  { id: 'length', label: 'Au moins 8 caractères' },
  { id: 'uppercase', label: 'Une lettre majuscule' },
  { id: 'lowercase', label: 'Une lettre minuscule' },
  { id: 'number', label: 'Un chiffre' },
  { id: 'special', label: 'Un caractère special' },
];

const countryCodes = [
  { code: '+1', label: 'US/Canada' },
  { code: '+44', label: 'UK' },
  { code: '+33', label: 'France' },
  { code: '+91', label: 'India' },
  { code: '+234', label: 'Nigeria' },
  { code: '+226', label: 'Burkina Faso' },
];

export default function RegisterScreen() {
  const { colors } = useThemeStore();
  const { signUp, loading: authLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    superRole: 'user',
    nationality: 'national',
    account_status: 'healthy',
    password: '',
    confirmPassword: '',
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState('+226');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const checkPasswordRequirement = (requirement: string) => {
    const { password } = formData;
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

  const handleSignUp = async () => {
    try {
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.role ||
        !formData.password
      ) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const allRequirementsMet = passwordRequirements.every((req) =>
        checkPasswordRequirement(req.id)
      );

      if (!allRequirementsMet) {
        throw new Error('Please meet all password requirements');
      }

      await signUp(formData.email, formData.password, {
        role: formData.role as 'worker' | 'technician' | 'entrepreneur',
        super_role: formData.superRole as
          | 'user'
          | 'admin'
          | 'organization'
          | 'government'
          | 'moderator'
          | 'technology'
          | 'law'
          | 'finance',
        full_name: formData.fullName,
        phone: `${selectedCountryCode}${formData.phone}`,
        nationality: formData.nationality as
          | 'national'
          | 'international'
          | 'foreign',
        specialization: null,
        availability_status: 'available',
        verification_status: 'not_verified',
        docs_status: 'pending',
        profile_picture: null,
        actual_location: null,
        availability_locations: [],
        portfolio: [],
        bio: null,
        certifications: [],
        skills: [],
        work_experience: [],
        education: [],
        languages: [],
        status: 'active',
        active: true,
        account_status: formData.account_status as
          | 'healthy'
          | 'warning'
          | 'suspended'
          | 'deleted',
        account_verified: false,
        metadata: {},
      });

      router.push('/verify-email');
    } catch (err) {
      // error handled by the store
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Créer un compte
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Rejoingnez notre communauté et commencez à explorer les opportunités
          </Text>
        </Animated.View>

        <View style={styles.progress}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: '25%' },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            Etape 1 de 4
          </Text>
        </View>

        {error && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: colors.error + '20' },
            ]}
          >
            <AlertCircle size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color={colors.muted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Nom complet"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.muted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Adresse email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.phoneContainer}>
            <TouchableOpacity
              style={[styles.countryCode, { backgroundColor: colors.card }]}
              onPress={() => {
                // Logic to open a dropdown for country codes
              }}
            >
              <Text style={[styles.countryCodeText, { color: colors.text }]}>
                {selectedCountryCode}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.phoneInput, { color: colors.text }]}
              placeholder="Numéro de tелефone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              placeholderTextColor={colors.muted}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sélectionnez votre rôle
          </Text>

          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleButton,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    formData.role === role.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormData({ ...formData, role: role.id })}
            >
              <View style={styles.roleInfo}>
                <Text style={[styles.roleTitle, { color: colors.text }]}>
                  {role.label}
                </Text>
                <Text style={[styles.roleDescription, { color: colors.muted }]}>
                  {role.description}
                </Text>
              </View>
              {formData.role === role.id && (
                <Check size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.muted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Mot de passe"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry={!showPassword}
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.muted} />
              ) : (
                <Eye size={20} color={colors.muted} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.requirements}>
            {passwordRequirements.map((req) => (
              <View
                key={req.id}
                style={[
                  styles.requirementItem,
                  // { backgroundColor: colors.card },
                ]}
              >
                {checkPasswordRequirement(req.id) ? (
                  <Check size={14} color={colors.success} />
                ) : (
                  <AlertCircle size={14} color={colors.muted} />
                )}
                <Text
                  style={[
                    styles.requirementText,
                    {
                      color: checkPasswordRequirement(req.id)
                        ? colors.success
                        : colors.muted,
                    },
                  ]}
                >
                  {req.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.muted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.muted} />
              ) : (
                <Eye size={20} color={colors.muted} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms ? (
              <CheckSquare size={20} color={colors.primary} />
            ) : (
              <Square size={20} color={colors.muted} />
            )}
            <Text style={[styles.termsText, { color: colors.text }]}>
              J'accepte les{' '}
              <Text
                style={[styles.linkText, { color: colors.primary }]}
                onPress={() => router.push('https://terms-and-conditions')}
              >
                Conditions d'utilisation
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              authLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={authLoading}
          >
            <Text style={[styles.submitButtonText, { color: colors.card }]}>
              {authLoading ? 'Creation de compte...' : 'Créer un compte'}
            </Text>
            <ChevronRight size={20} color={colors.card} />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.muted }]}>
              Vous avez déjà un compte ?
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
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
  },
  progress: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  eyeButton: {
    padding: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginTop: 8,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleInfo: {
    flex: 1,
    marginRight: 12,
  },
  roleTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  roleDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  requirements: {
    gap: 5,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
  },
  requirementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginRight: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  loginLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 8,
  },
  linkText: {
    fontFamily: 'Inter-SemiBold',
    textDecorationLine: 'underline',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  countryCodeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});
