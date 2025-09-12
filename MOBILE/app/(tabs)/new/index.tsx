import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  Users,
  ChevronRight,
  MapPin,
  Bookmark,
  TrendingUp,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useMissionStore } from '@/stores/mission';
import { useQuickStartStore } from '@/stores/quick_starts';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useEffect } from 'react';

export default function NewMissionLandingScreen() {
  const { colors } = useThemeStore();
  const { setDraftMission } = useMissionStore();
  const { quickStarts, fetchQuickStarts, incrementUsageCount, loading } =
    useQuickStartStore();
  const [selectedQuickStart, setSelectedQuickStart] = useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQuickStarts();
  }, []);

  const handleCreateFromScratch = () => {
    setDraftMission(null);
    router.push('/new/create');
  };

  const handleUseQuickStart = async (quickStart: any) => {
    setSelectedQuickStart(quickStart.id);

    // Increment usage count
    await incrementUsageCount(quickStart.id);

    // Set draft mission with quick start data
    setDraftMission({
      ...quickStart.mission_data,
      proposed_advantages: [
        ...(quickStart.mission_data.proposed_advantages || []),
      ],
    });

    // Add a small delay for visual feedback
    setTimeout(() => {
      router.push('/new/create');
    }, 300);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchQuickStarts();
    } catch (error) {
      console.error('Error refreshing quick starts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
            title="Actualisation..." // iOS
            titleColor={colors.text} // iOS
            progressBackgroundColor={colors.card} // Android
            style={{ zIndex: -1, backgroundColor: 'transparent' }}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../../assets/img4.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Animated.View entering={FadeInUp.delay(200)}>
              <Text style={styles.heroTitle}>Créer une Mission</Text>
              <Text style={styles.heroSubtitle}>
                Trouvez les meilleurs talents agricoles pour vos projets
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Content Container */}
        <>
          {/* Quick Start Section */}
          <View style={styles.quickStartSection}>
            <Animated.View entering={FadeInDown.delay(500)}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Démarrage rapide
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
                Choisissez comment vous souhaitez créer votre mission
              </Text>
            </Animated.View>

            {/* Create from Scratch Button */}
            <Animated.View entering={FadeInDown.delay(600)}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCreateFromScratch}
                activeOpacity={0.8}
              >
                <View style={styles.createButtonContent}>
                  <View
                    style={[
                      styles.createButtonIcon,
                      { backgroundColor: colors.card + '20' },
                    ]}
                  >
                    <Plus size={28} color={colors.card} />
                  </View>
                  <View style={styles.createButtonText}>
                    <Text
                      style={[styles.createButtonTitle, { color: colors.card }]}
                    >
                      Créer depuis zéro
                    </Text>
                    <Text
                      style={[
                        styles.createButtonSubtitle,
                        { color: colors.card + 'CC' },
                      ]}
                    >
                      Personnalisez entièrement votre mission
                    </Text>
                  </View>
                  <ChevronRight size={24} color={colors.card} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Loading State */}
            {loading && (
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={[
                  styles.loadingContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>
                  Chargement des modèles...
                </Text>
              </Animated.View>
            )}

            {/* Quick Starts Section */}
            {!loading && quickStarts.length > 0 && (
              <>
                <Animated.View entering={FadeInDown.delay(900)}>
                  <Text style={[styles.templatesTitle, { color: colors.text }]}>
                    Vos modèles sauvegardés
                  </Text>
                  <Text
                    style={[styles.templatesSubtitle, { color: colors.muted }]}
                  >
                    Réutilisez vos missions précédentes
                  </Text>
                </Animated.View>

                <View style={styles.templatesGrid}>
                  {quickStarts.slice(0, 3).map((quickStart, index) => (
                    <Animated.View
                      key={quickStart.id}
                      entering={FadeInDown.delay(1000 + index * 100)}
                    >
                      <TouchableOpacity
                        style={[
                          styles.templateCard,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border || '#e5e7eb',
                          },
                          selectedQuickStart === quickStart.id && {
                            borderColor: colors.primary,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => handleUseQuickStart(quickStart)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.templateHeader}>
                          <View
                            style={[
                              styles.templateIcon,
                              { backgroundColor: colors.success + '20' },
                            ]}
                          >
                            <Bookmark size={24} color={colors.success} />
                          </View>
                          <View
                            style={[
                              styles.templateBadge,
                              { backgroundColor: colors.success + '10' },
                            ]}
                          >
                            <TrendingUp size={12} color={colors.success} />
                            <Text
                              style={[
                                styles.templateBadgeText,
                                { color: colors.success },
                              ]}
                            >
                              {quickStart.usage_count} utilisations
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[styles.templateTitle, { color: colors.text }]}
                          numberOfLines={2}
                        >
                          {quickStart.title}
                        </Text>
                        <Text
                          style={[
                            styles.templateDescription,
                            { color: colors.muted },
                          ]}
                          numberOfLines={3}
                        >
                          {quickStart.description || 'Modèle personnalisé'}
                        </Text>

                        <View style={styles.templateMeta}>
                          <View style={styles.templateMetaItem}>
                            <Users size={14} color={colors.muted} />
                            <Text
                              style={[
                                styles.templateMetaText,
                                { color: colors.muted },
                              ]}
                              numberOfLines={1}
                            >
                              {quickStart.mission_data.needed_actor_amount || 1}{' '}
                              {quickStart.mission_data.needed_actor || 'worker'}
                              (s)
                            </Text>
                          </View>
                          <View style={styles.templateMetaItem}>
                            <MapPin size={14} color={colors.muted} />
                            <Text
                              style={[
                                styles.templateMetaText,
                                { color: colors.muted },
                              ]}
                              numberOfLines={1}
                            >
                              {quickStart.mission_data.location ||
                                'Localisation'}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.templateFooter,
                            { borderTopColor: colors.border || '#f3f4f6' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.templateUseText,
                              { color: colors.success },
                            ]}
                          >
                            Utiliser ce modèle
                          </Text>
                          <ChevronRight size={16} color={colors.success} />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Tips Section*/}
          <View
            style={[styles.tipsSection, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Conseils pour une mission réussie
            </Text>
            <View style={styles.tipsList}>
              {[
                'Soyez précis dans la description de votre mission',
                'Indiquez clairement les compétences requises',
                'Proposez une rémunération attractive',
                'Ajoutez des photos de qualité de votre exploitation',
              ].map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View
                    style={[
                      styles.tipBullet,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                  <Text style={[styles.tipText, { color: colors.text }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  // contentContainer: {
  //   flex: 1,
  //   paddingBottom: 150,
  // },
  heroSection: {
    height: 300,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  quickStartSection: {
    padding: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  createButtonText: {
    flex: 1,
  },
  createButtonTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  templatesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 8,
  },
  templatesSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  templatesGrid: {
    gap: 16,
    marginBottom: 24,
  },
  templateCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  templateBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  templateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 24,
  },
  templateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  templateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 120,
  },
  templateMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    flex: 1,
  },
  templateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  templateUseText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  tipsSection: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tipsList: {
    gap: 12,
    marginTop: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    marginVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 12,
  },
});