import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Share,
  Linking,
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
} from 'lucide-react-native';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { useThemeStore } from '@/stores/theme';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AgroLogo from '../../components/AgroLogo';
import { useNotificationStore } from '@/stores/notification';

const testimonials = [
  {
    id: '1',
    name: 'Marie Laurent',
    role: 'Agricultrice',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop',
    text: "AGRO m'a permis de trouver rapidement des travailleurs qualifiés pour ma récolte.",
  },
  {
    id: '2',
    name: 'Thomas Dubois',
    role: 'Technicien Agricole',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1200&auto=format&fit=crop',
    text: "Une plateforme qui valorise vraiment l'expertise technique en agriculture.",
  },
];

const features = [
  {
    title: 'Recrutement Simplifié',
    description: 'Trouvez les meilleurs talents agricoles en quelques clics',
    icon: Users,
  },
  {
    title: 'Vérification Complète',
    description: 'Profils et compétences vérifiés pour plus de sécurité',
    icon: CheckCircle2,
  },
  {
    title: 'Couverture Nationale',
    description: 'Un réseau de professionnels dans toute le Burkina Faso',
    icon: MapPin,
  },
];

// Function to handle sharing the app link
const handleShareApp = async () => {
  try {
    const result = await Share.share({
      message:
        'Découvrez AGRO, la plateforme qui connecte les talents agricoles : https://agro-app.com',
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

export default function HomeScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { colors } = useThemeStore();
  const { notifications } = useNotificationStore();
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AgroLogo color={colors.primary} size={32} />
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              fontSize: 24,
              color: colors.primary,
              marginLeft: 8,
            }}
          >
            Agro
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => setShowNotifications(true)}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Bell size={24} color={colors.primary} />
            {unreadNotifications > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.card }]}>
                  {unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Billboard Section */}
      <View style={styles.billboard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop',
          }}
          style={styles.billboardImage}
        />
        <View style={styles.billboardOverlay} />
        <View style={styles.billboardContent}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={styles.billboardTitle}>Le Futur de l'Agriculture</Text>
            <Text style={styles.billboardSubtitle}>
              Connectez-vous avec les meilleurs talents agricoles et accédez à
              des opportunités dans un environnement de confiance.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400)}
            style={styles.ctaContainer}
          >
            {/* Primary CTA - Larger with icon */}
            <TouchableOpacity
              style={[
                styles.ctaButton,
                styles.primaryCta,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
              onPress={() => router.push('/new/create')}
            >
              <Text style={[styles.ctaText, { color: colors.card }]}>
                Commencer
              </Text>
              <ArrowRight size={20} color={colors.card} />
            </TouchableOpacity>

            {/* Secondary CTA - Outlined */}
            <TouchableOpacity
              style={[
                styles.ctaButton,
                styles.secondaryCta,
                {
                  borderColor: colors.card,
                  backgroundColor: 'rgba(255, 255, 255, 0.42)',
                },
              ]}
              onPress={() => Linking.openURL('http://localhost:5173/about')}
            >
              <Text style={[styles.ctaText, { color: colors.card }]}>
                En savoir plus
              </Text>
              <ChevronRight size={20} color={colors.card} />
            </TouchableOpacity>

            {/* Share Button - Icon only with optional text */}
            <TouchableOpacity
              style={[
                styles.ctaButton,
                styles.shareButton,
                {
                  backgroundColor: 'rgba(235, 255, 230, 0.44)',
                },
              ]}
              onPress={handleShareApp}
            >
              <Share2 size={20} color={colors.card} />
              <Text style={[styles.shareText, { color: colors.card }]}>
                Partager
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Pourquoi choisir AGRO ?
        </Text>
        <View style={styles.features}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInDown.delay(index * 100)}
              style={[styles.featureCard, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <feature.icon size={24} color={colors.primary} />
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

      {/* Our Mission */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notre Mission
        </Text>
        <Text style={[styles.featureDescription, { color: colors.muted }]}>
          Nous avons pour mission d'autonomiser les professionnels agricoles
          grâce à la technologie et à la collaboration. En connectant experts,
          innovateurs et producteurs, nous construisons un avenir plus durable
          et efficace pour l'agriculture.
        </Text>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ce que disent nos utilisateurs
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.testimonials}
        >
          {testimonials.map((testimonial, index) => (
            <Animated.View
              key={testimonial.id}
              entering={FadeInDown.delay(index * 100)}
              style={[styles.testimonialCard, { backgroundColor: colors.card }]}
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
                </View>
              </View>
              <Text style={[styles.testimonialText, { color: colors.text }]}>
                "{testimonial.text}"
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Contact Us */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Contactez-nous
        </Text>
        <Text style={[styles.featureDescription, { color: colors.muted }]}>
          Vous avez des questions sur notre plateforme ? Nous sommes là pour
          vous aider à vous connecter avec la communauté agricole.
        </Text>

        <Text style={[styles.featureDescription, { color: colors.muted }]}>
          <Text style={{ fontWeight: 'bold' }}>Email:</Text>{' '}
          <Text style={{ color: 'green' }}>service@agro.com</Text>
        </Text>
        <Text style={[styles.featureDescription, { color: colors.muted }]}>
          <Text style={{ fontWeight: 'bold' }}>Téléphone:</Text>{' '}
          <Text style={{ color: 'green' }}>+226 ----------</Text>
        </Text>
        <Text style={[styles.featureDescription, { color: colors.muted }]}>
          Nous vous remercions de votre confiance et de votre soutien.
        </Text>
      </View>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 48,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },

  ctaContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 150,
    minHeight: 48,
    gap: 8,
  },

  primaryCta: {
    flex: 1,
    minWidth: '50%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  secondaryCta: {
    borderWidth: 1,
    flex: 1,
    minWidth: '50%',
  },

  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ctaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginRight: 8,
  },

  shareText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },

  billboard: {
    height: 500,
    position: 'relative',
  },
  billboardImage: {
    width: '100%',
    height: '100%',
  },
  billboardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  billboardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    justifyContent: 'center',
  },
  billboardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#ffffff',
    marginBottom: 16,
  },
  billboardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryCtaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  secondaryCtaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -48,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
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
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
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
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  featuresSection: {
    padding: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
  },
  features: {
    gap: 16,
  },
  featureCard: {
    padding: 24,
    borderRadius: 16,
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
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  shareSection: {
    padding: 24,
  },
  shareButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  testimonialsSection: {
    padding: 24,
  },
  testimonials: {
    paddingRight: 24,
    gap: 16,
  },
  testimonialCard: {
    width: 300,
    padding: 24,
    borderRadius: 16,
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
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  testimonialRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  testimonialText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  section: {
    padding: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 16,
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
});
