import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  ChevronRight,
  CheckSquare,
  Square,
  ChevronDown,
  Shield,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { useLinkStore } from '@/stores/dynamic_links';
import { Toast, ToastType } from '@/components/Toast';
import { CountryCodeModal } from '@/components/modals/CountryCodeModal';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';
import {
  workerSpecializations,
  advisorSpecializations,
} from '@/constants/specializations';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  small: 320,
  medium: 768,
  large: 1024,
};

// Responsive helper functions
const isSmallScreen = screenWidth < BREAKPOINTS.small;
const isMediumScreen =
  screenWidth >= BREAKPOINTS.small && screenWidth < BREAKPOINTS.medium;
const isLargeScreen = screenWidth >= BREAKPOINTS.medium;
const isTablet = screenWidth >= BREAKPOINTS.medium;

// Dynamic sizing functions
const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const getResponsivePadding = () => getResponsiveValue(16, 24, 32);
const getResponsiveFontSize = (baseSize: number) =>
  getResponsiveValue(baseSize - 2, baseSize, baseSize + 2);
const getResponsiveHeight = () => getResponsiveValue(44, 48, 52);

const roles = [
  {
    id: 'worker',
    label: 'Ouvrier',
    description: 'Trouver des opportunités de travail',
  },
  {
    id: 'advisor',
    label: 'Conseiller agricole',
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

export default function RegisterScreen() {
  const { colors } = useThemeStore();
  const { signUp, loading: authLoading, error } = useAuthStore();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
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
    actor_specialization: '',
    customSpecialization: '',
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState('+226');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] =
    useState(false);
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const { links, fetchLinks } = useLinkStore();

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');
  const hideToast = () => setToastVisible(false);

  useEffect(() => {
    fetchLinks();

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, [fetchLinks]);

  const termsAndConditionsLink =
    links.find((link) => link.category === 'website-terms&conditions')?.link ||
    '';

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const getSpecializationCategories = () => {
    if (formData.role === 'advisor') return advisorSpecializations;
    if (formData.role === 'worker') return workerSpecializations;
    return [];
  };

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

      if (['technician', 'worker'].includes(formData.role)) {
        if (!formData.actor_specialization) {
          throw new Error('Please select a specialization');
        }
        if (
          formData.actor_specialization === 'other' &&
          !formData.customSpecialization.trim()
        ) {
          throw new Error('Please specify your specialization');
        }
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

      if (!agreeToTerms) {
        throw new Error('You must agree to the terms and conditions');
      }

      await signUp(formData.email, formData.password, {
        role: formData.role as 'worker' | 'advisor' | 'entrepreneur',
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
        specialization: formData.actor_specialization as
          | 'crop_production_worker'
          | 'livestock_worker'
          | 'mechanized_worker'
          | 'specialized_worker'
          | 'seasonal_worker'
          | 'agroforestry_worker'
          | 'nursery_worker'
          | 'aquaculture_worker'
          | 'horticulture_market_gardening'
          | 'fruit_cultivation_orchard'
          | 'irrigation'
          | 'agricultural_machinery'
          | 'livestock_farming'
          | 'smart_agriculture'
          | 'agricultural_drone'
          | 'large_scale_production'
          | 'phytosanitary'
          | 'soil_science'
          | 'agricultural_development'
          | 'project_management'
          | 'agroecology'
          | 'farm_management'
          | 'agrifood'
          | 'rural_land'
          | 'aquaculture'
          | 'other',
        other_specialization: formData.customSpecialization,
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

      if (error) {
        showToast('error', 'Échec de la création du compte');
        return;
      } else {
        setTimeout(() => {
          router.push('/verify-email');
        }, 1000);
      }

      showToast('success', 'Compte créé avec succès! Vérifiez votre email.');
    } catch (err) {
      // error handled by the store
      const errorMessage =
        err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
      showToast('error', errorMessage);
    }
  };

  // Dynamic styles based on screen dimensions
  const responsiveStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: getResponsivePadding(),
      maxWidth: isTablet ? 600 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    header: {
      marginBottom: getResponsiveValue(24, 32, 40),
    },
    title: {
      fontFamily: 'Inter-Bold',
      fontSize: getResponsiveFontSize(32),
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(16),
      lineHeight: getResponsiveFontSize(24),
    },
    progress: {
      marginBottom: getResponsiveValue(16, 24, 32),
    },
    progressBar: {
      height: getResponsiveValue(3, 4, 5),
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
    progressText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(14),
      marginTop: 8,
    },
    form: {
      gap: getResponsiveValue(12, 16, 20),
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: getResponsiveValue(6, 8, 10),
      paddingHorizontal: getResponsiveValue(10, 12, 16),
      minHeight: getResponsiveHeight(),
    },
    input: {
      flex: 1,
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(16),
      paddingVertical: getResponsiveValue(10, 12, 14),
      marginLeft: 8,
    },
    eyeButton: {
      padding: getResponsiveValue(6, 8, 10),
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: getResponsiveFontSize(18),
      marginTop: getResponsiveValue(6, 8, 12),
    },
    roleButton: {
      flexDirection: isTablet ? 'row' : 'column',
      alignItems: isTablet ? 'center' : 'flex-start',
      justifyContent: 'space-between',
      padding: getResponsiveValue(12, 16, 20),
      borderRadius: getResponsiveValue(8, 12, 16),
      borderWidth: 1,
      minHeight: getResponsiveValue(60, 70, 80),
    },
    roleInfo: {
      flex: 1,
      marginRight: isTablet ? 12 : 0,
      marginBottom: isTablet ? 0 : 8,
    },
    roleTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: getResponsiveFontSize(16),
      marginBottom: 4,
    },
    roleDescription: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(14),
      lineHeight: getResponsiveFontSize(20),
    },
    requirements: {
      gap: getResponsiveValue(4, 6, 8),
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getResponsiveValue(4, 6, 8),
      borderRadius: 8,
    },
    requirementText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(12),
      marginLeft: 8,
      lineHeight: getResponsiveFontSize(16),
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: getResponsiveValue(12, 14, 16),
      borderRadius: getResponsiveValue(6, 8, 10),
      marginTop: getResponsiveValue(6, 8, 12),
      minHeight: getResponsiveHeight(),
    },
    submitButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: getResponsiveFontSize(16),
      marginRight: 8,
    },
    loginContainer: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: getResponsiveValue(12, 16, 20),
      gap: isSmallScreen ? 4 : 0,
    },
    loginText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(14),
    },
    loginLink: {
      fontFamily: 'Inter-SemiBold',
      fontSize: getResponsiveFontSize(14),
      marginLeft: isSmallScreen ? 0 : 4,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: getResponsiveValue(12, 16, 20),
    },
    termsText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(14),
      marginLeft: 8,
      flex: 1,
      lineHeight: getResponsiveFontSize(20),
    },
    phoneContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getResponsiveValue(4, 6, 8),
    },
    countryCode: {
      padding: getResponsiveValue(8, 10, 12),
      width: getResponsiveValue(70, 80, 90),
      borderRadius: getResponsiveValue(6, 8, 10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      minHeight: getResponsiveHeight(),
    },
    countryCodeText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(16),
    },
    phoneInput: {
      flex: 1,
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(16),
      paddingVertical: getResponsiveValue(10, 12, 14),
      borderWidth: 1,
      borderRadius: getResponsiveValue(6, 8, 10),
      paddingHorizontal: getResponsiveValue(10, 12, 16),
      minHeight: getResponsiveHeight(),
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: getResponsiveValue(12, 16, 20),
      borderRadius: getResponsiveValue(6, 8, 10),
      borderWidth: 1,
      minHeight: getResponsiveHeight(),
    },
    dropdownButtonText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(16),
      flex: 1,
    },
    dropdownContainer: {
      borderRadius: getResponsiveValue(6, 8, 10),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      marginTop: 4,
      maxHeight: getResponsiveValue(200, 250, 300),
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: getResponsiveValue(10, 12, 16),
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
      minHeight: getResponsiveValue(44, 48, 52),
    },
    dropdownItemText: {
      fontFamily: 'Inter-Regular',
      fontSize: getResponsiveFontSize(16),
      flex: 1,
    },
  });

  return (
    <View style={responsiveStyles.container}>
      <KeyboardAwareScrollView
        style={[responsiveStyles.container, { backgroundColor: colors.card }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: dimensions.height }}
      >
        <Toast
          visible={toastVisible}
          type={toastType}
          message={toastMessage}
          onHide={hideToast}
          duration={3000}
        />
        <View style={responsiveStyles.content}>
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={responsiveStyles.header}
          >
            <Text style={[responsiveStyles.title, { color: colors.text }]}>
              Créer un compte
            </Text>
            <Text style={[responsiveStyles.subtitle, { color: colors.muted }]}>
              Rejoingnez notre communauté et commencez à explorer les
              opportunités
            </Text>
          </Animated.View>

          <View style={responsiveStyles.progress}>
            <View
              style={[
                responsiveStyles.progressBar,
                { backgroundColor: colors.border },
              ]}
            >
              <Animated.View
                style={[
                  responsiveStyles.progressFill,
                  { backgroundColor: colors.primary, width: '25%' },
                ]}
              />
            </View>
            <Text
              style={[responsiveStyles.progressText, { color: colors.muted }]}
            >
              Etape 1 de 4
            </Text>
          </View>

          <View style={responsiveStyles.form}>
            <View
              style={[
                responsiveStyles.inputContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <User
                size={getResponsiveValue(18, 20, 22)}
                color={colors.muted}
              />
              <TextInput
                style={[responsiveStyles.input, { color: colors.text }]}
                placeholder="Nom complet"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholderTextColor={colors.muted}
              />
            </View>

            <View
              style={[
                responsiveStyles.inputContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Mail
                size={getResponsiveValue(18, 20, 22)}
                color={colors.muted}
              />
              <TextInput
                style={[responsiveStyles.input, { color: colors.text }]}
                placeholder="Adresse email"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={responsiveStyles.phoneContainer}>
              <TouchableOpacity
                style={[
                  responsiveStyles.countryCode,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowCountryCodeModal(true)}
              >
                <Text
                  style={[
                    responsiveStyles.countryCodeText,
                    { color: colors.text },
                  ]}
                >
                  {selectedCountryCode}
                </Text>
                <ChevronDown
                  size={getResponsiveValue(14, 16, 18)}
                  color={colors.muted}
                />
              </TouchableOpacity>
              <TextInput
                style={[
                  responsiveStyles.phoneInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  { color: colors.text },
                ]}
                placeholder="Numéro de téléphone"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
                placeholderTextColor={colors.muted}
              />
            </View>

            <Text
              style={[responsiveStyles.sectionTitle, { color: colors.text }]}
            >
              Sélectionnez votre rôle
            </Text>

            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  responsiveStyles.roleButton,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      formData.role === role.id
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    role: role.id,
                    actor_specialization: '',
                    customSpecialization: '',
                  })
                }
              >
                <View style={responsiveStyles.roleInfo}>
                  <Text
                    style={[responsiveStyles.roleTitle, { color: colors.text }]}
                  >
                    {role.label}
                  </Text>
                  <Text
                    style={[
                      responsiveStyles.roleDescription,
                      { color: colors.muted },
                    ]}
                  >
                    {role.description}
                  </Text>
                </View>
                {formData.role === role.id && (
                  <Check
                    size={getResponsiveValue(18, 20, 22)}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}

            {(formData.role === 'advisor' || formData.role === 'worker') && (
              <View>
                <Text
                  style={[
                    responsiveStyles.sectionTitle,
                    { color: colors.text, marginTop: 16 },
                  ]}
                >
                  Spécialisation
                </Text>

                <TouchableOpacity
                  style={[
                    responsiveStyles.dropdownButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    setShowSpecializationDropdown(!showSpecializationDropdown)
                  }
                >
                  <Text
                    style={[
                      responsiveStyles.dropdownButtonText,
                      {
                        color: formData.actor_specialization
                          ? colors.text
                          : colors.muted,
                      },
                    ]}
                  >
                    {formData.actor_specialization
                      ? getSpecializationCategories().find(
                          (cat) => cat.value === formData.actor_specialization
                        )?.label || 'Select specialization'
                      : 'Sélectionnez votre spécialisation'}
                  </Text>
                  <ChevronDown
                    size={getResponsiveValue(18, 20, 22)}
                    color={colors.muted}
                  />
                </TouchableOpacity>

                {showSpecializationDropdown && (
                  <ScrollView
                    style={[
                      responsiveStyles.dropdownContainer,
                      { backgroundColor: colors.card },
                    ]}
                    nestedScrollEnabled={true}
                  >
                    {getSpecializationCategories().map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={responsiveStyles.dropdownItem}
                        onPress={() => {
                          setFormData({
                            ...formData,
                            actor_specialization: category.value,
                            customSpecialization:
                              category.value === 'other'
                                ? formData.customSpecialization
                                : '',
                          });
                          setShowSpecializationDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            responsiveStyles.dropdownItemText,
                            { color: colors.text },
                          ]}
                        >
                          {category.label}
                        </Text>
                        {formData.actor_specialization === category.value && (
                          <Check
                            size={getResponsiveValue(18, 20, 22)}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Custom Specialization Input */}
                {formData.actor_specialization === 'other' && (
                  <View
                    style={[responsiveStyles.inputContainer, { marginTop: 8 }]}
                  >
                    <Shield
                      size={getResponsiveValue(18, 20, 22)}
                      color={colors.muted}
                    />
                    <TextInput
                      style={[responsiveStyles.input, { color: colors.text }]}
                      placeholder="Précisez votre spécialisation"
                      value={formData.customSpecialization}
                      onChangeText={(text) =>
                        setFormData({ ...formData, customSpecialization: text })
                      }
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                )}
              </View>
            )}

            <View
              style={[
                responsiveStyles.inputContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Lock
                size={getResponsiveValue(18, 20, 22)}
                color={colors.muted}
              />
              <TextInput
                style={[responsiveStyles.input, { color: colors.text }]}
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
                style={responsiveStyles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff
                    size={getResponsiveValue(18, 20, 22)}
                    color={colors.muted}
                  />
                ) : (
                  <Eye
                    size={getResponsiveValue(18, 20, 22)}
                    color={colors.muted}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={responsiveStyles.requirements}>
              {passwordRequirements.map((req) => (
                <View key={req.id} style={[responsiveStyles.requirementItem]}>
                  {checkPasswordRequirement(req.id) ? (
                    <Check
                      size={getResponsiveValue(12, 14, 16)}
                      color={colors.success}
                    />
                  ) : (
                    <AlertCircle
                      size={getResponsiveValue(12, 14, 16)}
                      color={colors.muted}
                    />
                  )}
                  <Text
                    style={[
                      responsiveStyles.requirementText,
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

            <View
              style={[
                responsiveStyles.inputContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Lock
                size={getResponsiveValue(18, 20, 22)}
                color={colors.muted}
              />
              <TextInput
                style={[responsiveStyles.input, { color: colors.text }]}
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
                style={responsiveStyles.eyeButton}
              >
                {showConfirmPassword ? (
                  <EyeOff
                    size={getResponsiveValue(18, 20, 22)}
                    color={colors.muted}
                  />
                ) : (
                  <Eye
                    size={getResponsiveValue(18, 20, 22)}
                    color={colors.muted}
                  />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={responsiveStyles.termsContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              {agreeToTerms ? (
                <CheckSquare
                  size={getResponsiveValue(18, 20, 22)}
                  color={colors.primary}
                />
              ) : (
                <Square
                  size={getResponsiveValue(18, 20, 22)}
                  color={colors.muted}
                />
              )}
              <Text
                style={[responsiveStyles.termsText, { color: colors.text }]}
              >
                J'accepte les{' '}
                <Text
                  style={[styles.linkText, { color: colors.primary }]}
                  onPress={() => Linking.openURL(termsAndConditionsLink)}
                >
                  Conditions d'utilisation
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                responsiveStyles.submitButton,
                { backgroundColor: colors.primary },
                authLoading && { opacity: 0.7 },
              ]}
              onPress={handleSignUp}
              disabled={authLoading}
            >
              <Text
                style={[
                  responsiveStyles.submitButtonText,
                  { color: colors.card },
                ]}
              >
                {authLoading ? 'Creation de compte...' : 'Créer un compte'}
              </Text>
              <ChevronRight
                size={getResponsiveValue(18, 20, 22)}
                color={colors.card}
              />
            </TouchableOpacity>

            <View style={responsiveStyles.loginContainer}>
              <Text
                style={[responsiveStyles.loginText, { color: colors.muted }]}
              >
                Vous avez déjà un compte ?
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text
                  style={[
                    responsiveStyles.loginLink,
                    { color: colors.primary },
                  ]}
                >
                  Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <CountryCodeModal
        visible={showCountryCodeModal}
        onClose={() => setShowCountryCodeModal(false)}
        onSelect={(country) => setSelectedCountryCode(country.code)}
        selectedCode={selectedCountryCode}
      />
    </View>
  );
}

// Additional styles for responsive elements
const styles = StyleSheet.create({
  linkText: {
    fontFamily: 'Inter-SemiBold',
    textDecorationLine: 'underline',
  },
});
