import React, { useState, useEffect } from 'react';
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
  Dimensions,
  Alert,
} from 'react-native';
import {
  Bell,
  Star,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Share2,
  ChevronRight,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Settings,
} from 'lucide-react-native';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { useThemeStore } from '@/stores/theme';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AgroLogo from '../../components/AgroLogo';
import { useNotificationStore } from '@/stores/notification';
import { useNotification } from '@/context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useLinkStore } from '@/stores/dynamic_links';

const { width } = Dimensions.get('window');

const features = [
  {
    title: 'Recrutement Simplifié',
    description: 'Trouvez les meilleurs talents agricoles en quelques clics',
    icon: Users,
    color: '#3b82f6',
  },
  {
    title: 'Vérification Complète',
    description: 'Profils et compétences vérifiés pour plus de sécurité',
    icon: CheckCircle2,
    color: '#10b981',
  },
  {
    title: 'Couverture Nationale',
    description: 'Un réseau de professionnels dans tout le Burkina Faso',
    icon: MapPin,
    color: '#f59e0b',
  },
  {
    title: 'Innovation Technologique',
    description: 'Outils modernes pour une agriculture de précision',
    icon: Zap,
    color: '#8b5cf6',
  },
];

export default function HomeScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { colors } = useThemeStore();
  const { notifications } = useNotificationStore();
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;
  const { links, fetchLinks } = useLinkStore();
  const { 
    expoPushToken, 
    notification, 
    error, 
    retryTokenRegistration,
    isTokenSaved,
    isSupported,
    permissionStatus
  } = useNotification();

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const playStoreLink =
    links.find((link) => link.category === 'play-store')?.link || '';

  const appStoreLink =
    links.find((link) => link.category === 'app-store')?.link || '';

  const websiteLink =
    links.find((link) => link.category === 'website')?.link || '';

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: `Découvrez AGRO, la plateforme qui connecte les talents agricoles : \n${playStoreLink}\n pour Android ou \n${appStoreLink}\n pour iOS. Visitez notre site pour en savoir plus : ${websiteLink}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing the app:', error);
    }
  };

  const PushNotificationStatus = () => {
    // Don't show anything if not supported
    if (!isSupported) {
      return null;
    }

    if (error) {
      return (
        <Animated.View 
          entering={FadeInDown.delay(1800)} 
          style={[styles.notificationStatus, { backgroundColor: colors.error + '20' }]}
        >
          <View style={styles.statusHeader}>
            <WifiOff size={20} color={colors.error} />
            <Text style={[styles.statusTitle, { color: colors.error }]}>
              Notifications désactivées
            </Text>
          </View>
          <Text style={[styles.statusMessage, { color: colors.error }]}>
            {error.message.includes('Firebase') 
              ? 'Configuration Firebase requise pour les notifications'
              : error.message.includes('Google Play Services')
              ? 'Google Play Services requis'
              : error.message.includes('permissions')
              ? 'Autorisations de notification requises'
              : 'Erreur de configuration des notifications'}
          </Text>
          <View style={styles.statusActions}>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.error }]}
              onPress={retryTokenRegistration}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
            {error.message.includes('permissions') && (
              <TouchableOpacity
                style={[styles.settingsButton, { borderColor: colors.error }]}
                onPress={() => {
                  Alert.alert(
                    'Autorisations requises',
                    'Veuillez activer les notifications dans les paramètres de votre appareil.',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Paramètres', onPress: () => Linking.openSettings() }
                    ]
                  );
                }}
              >
                <Settings size={16} color={colors.error} />
                <Text style={[styles.settingsButtonText, { color: colors.error }]}>
                  Paramètres
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      );
    }

    if (expoPushToken) {
      return (
        <Animated.View 
          entering={FadeInDown.delay(1800)} 
          style={[styles.notificationStatus, { backgroundColor: colors.success + '20' }]}
        >
          <View style={styles.statusHeader}>
            <Wifi size={20} color={colors.success} />
            <Text style={[styles.statusTitle, { color: colors.success }]}>
              Notifications activées
            </Text>
          </View>
          <Text style={[styles.statusMessage, { color: colors.success }]}>
            {isTokenSaved 
              ? 'Vous recevrez des notifications importantes'
              : 'Configuration en cours...'}
          </Text>
          {notification && (
            <View style={[styles.lastNotification, { backgroundColor: colors.card }]}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                Dernière notification:
              </Text>
              <Text style={[styles.notificationContent, { color: colors.muted }]}>
                {notification.request.content.title}
              </Text>
            </View>
          )}
        </Animated.View>
      );
    }

    // Show loading state for supported devices
    if (permissionStatus === 'undetermined') {
      return (
        <Animated.View 
          entering={FadeInDown.delay(1800)} 
          style={[styles.notificationStatus, { backgroundColor: colors.warning + '20' }]}
        >
          <View style={styles.statusHeader}>
            <AlertTriangle size={20} color={colors.warning} />
            <Text style={[styles.statusTitle, { color: colors.warning }]}>
              Configuration des notifications
            </Text>
          </View>
          <Text style={[styles.statusMessage, { color: colors.warning }]}>
            Configuration en cours...
          </Text>
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Animated.View
            entering={FadeInUp.delay(200)}
            style={styles.headerContent}
          >
            <View style={styles.logoSection}>
              <AgroLogo color={colors.primary} size={32} />
              <Text style={[styles.logoText, { color: colors.primary }]}>
                Agro
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: colors.primary + '15' },
              ]}
              onPress={() => setShowNotifications(true)}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Bell size={24} color={colors.primary} />
              {unreadNotifications > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.badgeText, { color: colors.card }]}>
                    {unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://raw.githubusercontent.com/marcus102/AGRO/refs/heads/main/assets/team/Productions_agricoles_du_Burkina_Faso.webp',
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.heroOverlay}
          />
          <View style={styles.heroContent}>
            <Animated.View entering={FadeInDown.delay(300)}>
              <Text style={styles.heroTitle}>Le Futur de l'Agriculture</Text>
              <Text style={styles.heroSubtitle}>
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
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => router.push('/new')}
              >
                <Text style={styles.primaryButtonText}>Commencer</Text>
                <ArrowRight size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => Linking.openURL(websiteLink)}
              >
                <Text style={styles.secondaryButtonText}>En savoir plus</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Push Notification Status */}
        <PushNotificationStatus />

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Animated.View entering={FadeInDown.delay(800)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pourquoi choisir AGRO ?
            </Text>
          </Animated.View>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInDown.delay(900 + index * 100)}
                style={[styles.featureCard, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color + '15' },
                  ]}
                >
                  <feature.icon size={28} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text
                  style={[styles.featureDescription, { color: colors.muted }]}
                >
                  {feature.description}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Mission Section */}
        <Animated.View
          entering={FadeInDown.delay(1200)}
          style={[styles.missionSection, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notre Mission
          </Text>
          <Text style={[styles.missionText, { color: colors.muted }]}>
            Nous avons pour mission d'autonomiser les professionnels agricoles
            grâce à la technologie et à la collaboration. En connectant experts,
            innovateurs et producteurs, nous construisons un avenir plus durable
            et efficace pour l'agriculture.
          </Text>
          <TouchableOpacity
            style={[
              styles.missionButton,
              { backgroundColor: colors.primary + '15' },
            ]}
            onPress={() => Linking.openURL('http://localhost:5173/about')}
          >
            <Text style={[styles.missionButtonText, { color: colors.primary }]}>
              Découvrir notre vision
            </Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Contact Section */}
        <Animated.View
          entering={FadeInDown.delay(1600)}
          style={[styles.contactSection, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contactez-nous
          </Text>
          <Text style={[styles.contactText, { color: colors.muted }]}>
            Vous avez des questions sur notre plateforme ? Nous sommes là pour
            vous aider à vous connecter avec la communauté agricole.
          </Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                Email:
              </Text>
              <Text style={[styles.contactValue, { color: colors.primary }]}>
                service@agro.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                Téléphone:
              </Text>
              <Text style={[styles.contactValue, { color: colors.primary }]}>
                {'+226 74 18 97 63\n+226 74 18 97 63'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: colors.primary }]}
            onPress={handleShareApp}
          >
            <Share2 size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Partager AGRO</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 48,
    paddingBottom: 20,
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
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  heroSection: {
    height: 400,
    position: 'relative',
    marginBottom: 40,
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
    fontSize: 42,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 32,
    lineHeight: 26,
    textAlign: 'center',
    opacity: 0.95,
  },
  heroActions: {
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
    minWidth: 180,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  notificationStatus: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  statusTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  statusMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  settingsButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  lastNotification: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginBottom: 4,
  },
  notificationContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 12,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  missionSection: {
    margin: 24,
    padding: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
});