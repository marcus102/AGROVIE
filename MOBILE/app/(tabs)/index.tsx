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
} from 'react-native';
import {
  Bell,
  Star,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Share2,
  ChevronRight,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { useThemeStore } from '@/stores/theme';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AgroLogo from '../../components/AgroLogo';
import { useNotificationStore } from '@/stores/notification';
import { LinearGradient } from 'expo-linear-gradient';
import { useLinkStore } from '@/stores/dynamic_links';

const { width } = Dimensions.get('window');

const testimonials = [
  {
    id: '1',
    name: 'Marie Laurent',
    role: 'Agricultrice',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop',
    text: "AGRO m'a permis de trouver rapidement des travailleurs qualifiés pour ma récolte.",
    rating: 5,
  },
  {
    id: '2',
    name: 'Thomas Dubois',
    role: 'Technicien Agricole',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1200&auto=format&fit=crop',
    text: "Une plateforme qui valorise vraiment l'expertise technique en agriculture.",
    rating: 5,
  },
  {
    id: '3',
    name: 'Aminata Traoré',
    role: 'Entrepreneur Agricole',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1200&auto=format&fit=crop',
    text: "Grâce à AGRO, j'ai pu développer mon exploitation avec des professionnels de confiance.",
    rating: 5,
  },
];

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
    description: 'Un réseau de professionnels dans toute le Burkina Faso',
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

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <Animated.View entering={FadeInDown.delay(1300)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ce que disent nos utilisateurs
            </Text>
          </Animated.View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsContent}
          >
            {testimonials.map((testimonial, index) => (
              <Animated.View
                key={testimonial.id}
                entering={FadeInDown.delay(1400 + index * 100)}
                style={[
                  styles.testimonialCard,
                  { backgroundColor: colors.card },
                ]}
              >
                <View style={styles.testimonialHeader}>
                  <Image
                    source={{ uri: testimonial.image }}
                    style={styles.testimonialImage}
                  />
                  <View style={styles.testimonialInfo}>
                    <Text
                      style={[styles.testimonialName, { color: colors.text }]}
                    >
                      {testimonial.name}
                    </Text>
                    <Text
                      style={[styles.testimonialRole, { color: colors.muted }]}
                    >
                      {testimonial.role}
                    </Text>
                    <View style={styles.ratingContainer}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          color="#f59e0b"
                          fill="#f59e0b"
                        />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={[styles.testimonialText, { color: colors.text }]}>
                  "{testimonial.text}"
                </Text>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

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
                +226 ----------
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
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
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
  testimonialsSection: {
    paddingLeft: 24,
    marginBottom: 40,
  },
  testimonialsContent: {
    paddingRight: 24,
    gap: 20,
  },
  testimonialCard: {
    width: 320,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  testimonialImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  testimonialRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
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
