import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Share,
  Linking,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Bell,
  Dot,
  ArrowRight,
  Share2,
  ChevronRight,
} from 'lucide-react-native';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { useThemeStore } from '@/stores/theme';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNotificationStore } from '@/stores/notification';
import { LinearGradient } from 'expo-linear-gradient';
import { useLinkStore } from '@/stores/dynamic_links';
import { WelcomeOverlay } from '@/components/modals/WelcomeOverlay';
import { FeedbackOverlay } from '@/components/modals/FeedbackOverlay';
import { useWelcomeFlow } from '@/hooks/useWelcomeFlow';
import { useAuthStore } from '@/stores/auth';
import { useMissionStore } from '@/stores/mission';
import { Toast, ToastType } from '@/components/Toast';
import { MissionsSection } from '@/components/mission/MissionsSection';
import { FeaturesSection } from '@/components/mission/FeaturesSection';
import {
  formatPrice,
  formatDate,
  filterMissionsByRole,
} from '@/utils/missionHelpers';

// Default fallback image
const DEFAULT_HERO_IMAGE = require('../../assets/img1.jpg');

// Constants for better performance
const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = Math.min(400, SCREEN_WIDTH * 0.8);

// Types for better type safety
interface ContactLinks {
  playStore: string;
  appStore: string;
  website: string;
}

interface NavigationRoute {
  pathname: string;
  params?: Record<string, any>;
}

export default function HomeScreen() {
  // State management
  const [showNotifications, setShowNotifications] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applyingToMission, setApplyingToMission] = useState<string | null>(
    null
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Refs for cleanup and optimization
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Store hooks
  const { colors } = useThemeStore();
  const { notifications } = useNotificationStore();
  const { links, fetchLinks, loading: linksLoading } = useLinkStore();
  const { showWelcome, showFeedback, markWelcomeShown, markFeedbackShown } =
    useWelcomeFlow();
  const { profile, user } = useAuthStore();
  const {
    missions,
    fetchMissions,
    updateMission,
    loading: missionsLoading,
    error: missionsError,
  } = useMissionStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Memoized calculations for better performance
  const unreadNotifications = useMemo(() => {
    try {
      return (
        notifications?.filter((notification) => !notification?.read)?.length ||
        0
      );
    } catch (error) {
      console.error('Error calculating unread notifications:', error);
      return 0;
    }
  }, [notifications]);

  // Memoized link extraction with better error handling
  const appLinks: ContactLinks = useMemo(() => {
    try {
      if (!Array.isArray(links)) {
        return { playStore: '', appStore: '', website: '' };
      }

      return {
        playStore:
          links.find((link) => link?.category === 'play-store')?.link || '',
        appStore:
          links.find((link) => link?.category === 'app-store')?.link || '',
        website: links.find((link) => link?.category === 'website')?.link || '',
      };
    } catch (error) {
      console.error('Error extracting app links:', error);
      return { playStore: '', appStore: '', website: '' };
    }
  }, [links]);

  // Filter missions with error handling
  const filteredMissions = useMemo(() => {
    try {
      if (!Array.isArray(missions) || !profile?.role) {
        return [];
      }
      return filterMissionsByRole(missions, profile.role);
    } catch (error) {
      console.error('Error filtering missions:', error);
      return [];
    }
  }, [missions, profile?.role]);

  // Toast management with cleanup
  const showToast = useCallback((type: ToastType, message: string) => {
    if (!isMountedRef.current) return;

    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);

    // Auto-hide toast after 3 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setToastVisible(false);
      }
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToastVisible(false);
  }, []);

  // Enhanced URL validation
  const isValidUrl = useCallback((url: string): boolean => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }

    try {
      const urlObj = new URL(url.trim());
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }, []);

  // Safe link opening with better error handling
  const handleOpenLink = useCallback(
    async (url: string, fallbackMessage?: string): Promise<void> => {
      if (isLoading) return;

      if (!url || !isValidUrl(url)) {
        Alert.alert(
          'Lien non disponible',
          fallbackMessage || "Ce lien n'est pas disponible pour le moment."
        );
        return;
      }

      setIsLoading(true);
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          throw new Error('URL not supported');
        }
      } catch (error) {
        console.error('Error opening link:', error);
        Alert.alert(
          'Erreur',
          "Impossible d'ouvrir ce lien. Veuillez vérifier votre connexion internet."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isValidUrl, isLoading]
  );

  // Enhanced share functionality
  const handleShareApp = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const hasLinks =
        appLinks.playStore || appLinks.appStore || appLinks.website;

      if (!hasLinks) {
        Alert.alert(
          'Information',
          'Les liens de partage ne sont pas encore disponibles.'
        );
        return;
      }

      let shareMessage =
        'Découvrez AGRO, la plateforme qui connecte les talents agricoles';

      if (appLinks.playStore) {
        shareMessage += `\n\n📱 Android: ${appLinks.playStore}`;
      }
      if (appLinks.appStore) {
        shareMessage += `\n🍎 iOS: ${appLinks.appStore}`;
      }
      if (appLinks.website) {
        shareMessage += `\n🌐 Site web: ${appLinks.website}`;
      }

      const result = await Share.share({
        message: shareMessage,
        title: 'AGRO - Plateforme Agricole',
      });

      if (result.action === Share.sharedAction) {
        showToast('success', 'Application partagée avec succès!');
      }
    } catch (error) {
      console.error('Error sharing the app:', error);
      Alert.alert(
        'Erreur',
        "Impossible de partager l'application pour le moment."
      );
    } finally {
      setIsLoading(false);
    }
  }, [appLinks, isLoading, showToast]);

  // Safe navigation with error handling
  const handleNavigation = useCallback((route: string | NavigationRoute) => {
    try {
      if (typeof route === 'string') {
        router.push(route as any);
      } else {
        router.push(route as any);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Erreur', 'Impossible de naviguer vers cette page.');
    }
  }, []);

  // Image error handling
  const handleImageError = useCallback((error: any) => {
    console.error('Hero image load error:', error);
    setImageError(true);
  }, []);

  // Enhanced mission application with better error handling

  // Enhanced mission application with better error handling
  const handleApplyToMission = useCallback(
    async (mission: any) => {
      if (!mission?.id) {
        showToast('error', 'Mission invalide');
        return;
      }

      if (!profile?.id || !user?.id) {
        showToast('error', 'Vous devez être connecté pour postuler');
        setTimeout(() => handleNavigation('/auth/login'), 1500);
        return;
      }

      // Check if user has already applied using profile.id
      const hasAlreadyApplied = mission.applicants?.some(
        (applicant: any) =>
          applicant?.id === profile.id || applicant === profile.id
      );

      if (hasAlreadyApplied) {
        showToast('info', 'Vous avez déjà postulé à cette mission');
        return;
      }

      if (applyingToMission) {
        showToast('info', 'Candidature en cours...');
        return;
      }

      setApplyingToMission(mission.id);
      try {
        // Create applicant object with profile data
        const applicantData = {
          id: profile.id,
          full_name: profile.full_name || 'Nom non spécifié',
          role: profile.role || 'Rôle non spécifié',
          applied_at: new Date().toISOString(), // Optional: add timestamp
        };

        // Get existing applicants and ensure it's an array
        const existingApplicants = Array.isArray(mission.applicants)
          ? mission.applicants
          : [];

        // Add new applicant data
        const updatedApplicants = [...existingApplicants, applicantData];

        await updateMission(mission.id, { applicants: updatedApplicants });

        if (isMountedRef.current) {
          showToast('success', 'Candidature envoyée avec succès!');
        }
      } catch (error) {
        console.error('Error applying to mission:', error);
        if (isMountedRef.current) {
          showToast(
            'error',
            'Erreur lors de la candidature. Veuillez réessayer.'
          );
        }
      } finally {
        if (isMountedRef.current) {
          setApplyingToMission(null);
        }
      }
    },
    [
      profile?.id,
      profile?.full_name,
      profile?.role,
      user?.id,
      updateMission,
      showToast,
      applyingToMission,
      handleNavigation,
    ]
  );

  // Data fetching with error handling
  const fetchData = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setRefreshing(true);
      }

      try {
        await Promise.allSettled([
          fetchLinks().catch((error) => {
            console.error('Failed to fetch links:', error);
            return Promise.resolve();
          }),
          fetchMissions().catch((error) => {
            console.error('Failed to fetch missions:', error);
            return Promise.resolve();
          }),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMountedRef.current) {
          showToast('error', 'Erreur lors du chargement des données');
        }
      } finally {
        if (showRefreshIndicator && isMountedRef.current) {
          setRefreshing(false);
        }
      }
    },
    [fetchLinks, fetchMissions, showToast]
  );

  // Initial data loading
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Notification toggle with safety check
  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Animated.View
          entering={FadeInUp.delay(200)}
          style={styles.headerContent}
        >
          <View style={styles.logoSection}>
            <Text
              style={[styles.logoText, { color: colors.primary }]}
              accessibilityLabel="Logo AGROVIA"
            >
              Agrovia
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.primary + '15' },
            ]}
            onPress={toggleNotifications}
            accessibilityLabel={`Notifications${
              unreadNotifications > 0 ? `, ${unreadNotifications} non lues` : ''
            }`}
            accessibilityRole="button"
            accessibilityHint="Ouvre le panneau des notifications"
            disabled={isLoading}
          >
            <Bell size={24} color={colors.primary} />
            {unreadNotifications > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Dot
                  size={12}
                  color={colors.primary}
                  style={{ position: 'absolute', top: 2, right: 2 }}
                />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            // Add these props to prevent overlay issues
            progressBackgroundColor={colors.background}
            style={{ zIndex: -1 }}
          />
        }
        // Add these props to ensure proper scrolling behavior
        bounces={true}
        alwaysBounceVertical={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { height: HERO_HEIGHT }]}>
          <Image
            source={DEFAULT_HERO_IMAGE}
            style={styles.heroImage}
            onError={handleImageError}
            accessibilityLabel="Image représentant l'agriculture moderne"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.heroOverlay}
          />
          <View style={styles.heroContent}>
            <Animated.View entering={FadeInDown.delay(300)}>
              <Text
                style={styles.heroTitle}
                accessibilityLabel="Titre principal: Le Futur de l'Agriculture"
              >
                Le Futur de l'Agriculture
              </Text>
              <Text
                style={styles.heroSubtitle}
                accessibilityLabel="Sous-titre: Connectez-vous avec les meilleurs talents agricoles"
              >
                Connectez-vous avec les meilleurs talents agricoles et accédez à
                des opportunités dans un environnement de confiance.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(500)}
              style={styles.heroActions}
            >
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: isLoading ? 0.7 : 1,
                  },
                ]}
                onPress={() => handleNavigation('/new')}
                accessibilityLabel="Commencer"
                accessibilityHint="Navigue vers la page de création de profil"
                accessibilityRole="button"
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>Commencer</Text>
                <ArrowRight size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { opacity: isLoading ? 0.7 : 1 },
                ]}
                onPress={() =>
                  handleOpenLink(
                    appLinks.website,
                    'Le site web sera bientôt disponible.'
                  )
                }
                accessibilityLabel="En savoir plus"
                accessibilityHint="Ouvre le site web pour plus d'informations"
                accessibilityRole="button"
                disabled={isLoading || linksLoading}
              >
                <Text style={styles.secondaryButtonText}>En savoir plus</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        <View>
          {/* Error State for Missions */}
          {missionsError && (
            <Animated.View
              entering={FadeInDown.delay(800)}
              style={[styles.errorContainer, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.errorText, { color: colors.text }]}>
                Erreur lors du chargement des missions
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => fetchMissions()}
              >
                <Text
                  style={[styles.retryButtonText, { color: colors.primary }]}
                >
                  Réessayer
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Missions Section */}
          {!missionsError && (
            <MissionsSection
              profile={profile}
              colors={colors}
              missionsLoading={missionsLoading}
              filteredMissions={filteredMissions}
              user={user}
              applyingToMission={applyingToMission}
              onApplyToMission={handleApplyToMission}
              formatPrice={formatPrice}
              formatDate={formatDate}
              fetchMissions={fetchMissions}
            />
          )}
        </View>

        <>
          {/* Features Section */}
          <FeaturesSection profile={profile} colors={colors} />

          {/* Mission Section - Fixed z-index and positioning */}
          <View
            style={[styles.missionSection, { backgroundColor: colors.card }]}
          >
            <Text
              style={[styles.sectionTitle, { color: colors.text }]}
              accessibilityLabel="Section: Notre Mission"
            >
              Notre Mission
            </Text>
            <Text style={[styles.missionText, { color: colors.text }]}>
              Nous avons pour mission d'autonomiser les professionnels agricoles
              grâce à la technologie et à la collaboration. En connectant
              experts, innovateurs et producteurs, nous construisons un avenir
              plus durable et efficace pour l'agriculture.
            </Text>
            <TouchableOpacity
              style={[
                styles.missionButton,
                {
                  backgroundColor: colors.primary + '15',
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={() =>
                handleOpenLink(
                  `${appLinks.website}about`,
                  'La page À propos sera bientôt disponible.'
                )
              }
              accessibilityLabel="Découvrir notre vision"
              accessibilityHint="Ouvre la page À propos sur le site web"
              accessibilityRole="button"
              disabled={isLoading}
            >
              <Text
                style={[styles.missionButtonText, { color: colors.primary }]}
              >
                Découvrir notre vision
              </Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Contact Section - Fixed z-index and positioning */}
          <View
            style={[styles.contactSection, { backgroundColor: colors.card }]}
          >
            <Text
              style={[styles.sectionTitle, { color: colors.text }]}
              accessibilityLabel="Section: Contactez-nous"
            >
              Contactez-nous
            </Text>
            <Text style={[styles.contactText, { color: colors.text }]}>
              Vous avez des questions sur notre plateforme ? Nous sommes là pour
              vous aider à vous connecter avec la communauté agricole.
            </Text>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Text style={[styles.contactLabel, { color: colors.text }]}>
                  Email:
                </Text>
                <Text
                  style={[styles.contactValue, { color: colors.primary }]}
                  accessibilityLabel="Email: support@agrovie.africa"
                >
                  service@agrovia.com
                </Text>
              </View>
              <View style={styles.contactItem}>
                <Text style={[styles.contactLabel, { color: colors.text }]}>
                  Téléphone:
                </Text>
                <Text
                  style={[styles.contactValue, { color: colors.primary }]}
                  accessibilityLabel="Téléphone: +226 74 18 97 63"
                >
                  {'+226 74 18 97 63\n+226 74 18 97 63'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.shareButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleShareApp}
              disabled={isLoading}
              accessibilityLabel="Partager AGRO"
              accessibilityHint="Partage l'application avec vos contacts"
              accessibilityRole="button"
            >
              <Share2 size={20} color="#fff" />
              <Text style={styles.shareButtonText}>
                {isLoading ? 'Partage...' : 'Partager AGRO'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </ScrollView>

      {/* Modals and Overlays - Fixed z-index */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <WelcomeOverlay
        visible={showWelcome}
        onClose={markWelcomeShown}
        userName={profile?.full_name || 'Utilisateur'}
      />
      <FeedbackOverlay visible={showFeedback} onClose={markFeedbackShown} />
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    // flexGrow: 1,
    // position: 'relative',
    paddingBottom: 150,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 48,
    paddingBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10, // Added to ensure header stays on top
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  notificationButton: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 10,
    height: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  heroSection: {
    position: 'relative',
    marginBottom: 40,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.min(40, SCREEN_WIDTH * 0.1),
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 32,
    lineHeight: 26,
    textAlign: 'center',
    opacity: 0.95,
  },
  heroActions: {
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 5,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
    minWidth: 150,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#fff',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
  },
  missionSection: {
    margin: 24,
    padding: 28,
    borderRadius: 20,
  },
  missionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  missionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  missionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  contactSection: {
    margin: 24,
    padding: 28,
    borderRadius: 20,
    marginBottom: 40,
  },
  contactText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  contactInfo: {
    gap: 12,
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  contactLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  contactValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  shareButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
  },
  errorContainer: {
    margin: 24,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    zIndex: 2,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
