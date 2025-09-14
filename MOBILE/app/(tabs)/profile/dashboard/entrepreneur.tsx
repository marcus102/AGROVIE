import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useThemeStore } from '@/stores/theme';
import {
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Target,
  Heart,
  Star,
  ArrowLeft,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ListItem } from '@/components/ListItem';
import { FilterBar } from '@/components/FilterBar';
import { useMissionStore } from '@/stores/mission';
import { useRatingStore } from '@/stores/ratings';
import { supabase } from '@/lib/supabase';
import { Mission } from '@/types/mission';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function EntrepreneurDashboard() {
  const { colors } = useThemeStore();
  const { fetchMissionByUserId } = useMissionStore();
  const { fetchAverageUserRating, userAverageRating } = useRatingStore();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch missions created by this entrepreneur
  const fetchUserData = async (userId: string): Promise<void> => {
    try {
      setLoading(true);

      // Fetch missions and ratings in parallel
      await Promise.all([
        fetchMissions(userId),
        fetchAverageUserRating(userId),
      ]);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissions = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await fetchMissionByUserId(userId);
      if (error) throw error;
      setMissions(data || []);
    } catch (error: any) {
      console.error('Error fetching missions:', error.message);
    }
  };

  useEffect(() => {
    const fetchAuthenticatedUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error('Error fetching user:', error?.message);
          return;
        }

        setUserId(user.id);
        await fetchUserData(user.id);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchAuthenticatedUser();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    if (!userId) return;

    setRefreshing(true);
    try {
      // Fetch both missions and ratings when refreshing
      await Promise.all([
        fetchMissions(userId),
        fetchAverageUserRating(userId),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Manual refresh handler (for the button)
  const handleRefresh = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!user) return;

    setRefreshing(true);
    try {
      await Promise.all([
        fetchMissions(user.id),
        fetchAverageUserRating(user.id),
      ]);
    } catch (error) {
      console.error('Error refreshing missions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter missions based on selected status
  const filteredMissions = missions.filter((mission) => {
    if (selectedFilter === 'All') return true;
    return mission.status === selectedFilter;
  });

  // Calculate statistics
  const totalMissions = missions.length;
  const activeMissions = missions.filter((mission) =>
    ['accepted', 'online', 'in_review'].includes(mission.status)
  ).length;

  const completedMissions = missions.filter(
    (mission) => mission.status === 'completed'
  ).length;

  const totalApplications = missions.reduce(
    (sum, mission) => sum + (mission.applicants?.length || 0),
    0
  );

  const matchRate =
    totalMissions > 0
      ? Math.round(
          (missions.filter((m) => (m.applicants?.length || 0) > 0).length /
            totalMissions) *
            100
        )
      : 0;

  const totalEarnings = completedMissions * 5000;
  // Format the average rating for display
  const ratingDisplay =
    userAverageRating !== null && userAverageRating !== undefined
      ? userAverageRating.toFixed(1)
      : 'N/A';

  // Entrepreneur-specific stats
  const STATS = [
    {
      title: 'Missions actives',
      value: activeMissions,
      icon: Briefcase,
      color: '#3b82f6',
    },
    {
      title: 'Candidatures',
      value: totalApplications,
      icon: Users,
      color: '#10b981',
    },
    {
      title: 'Taux de match',
      value: `${matchRate}%`,
      icon: Heart,
      color: '#f59e0b',
    },
    {
      title: 'Missions terminées',
      value: completedMissions,
      icon: CheckCircle2,
      color: '#8b5cf6',
    },
    {
      title: 'Note',
      value: ratingDisplay,
      icon: Star,
      color: '#ef4444',
    },
    {
      title: 'Recrutements',
      value: completedMissions,
      icon: TrendingUp,
      color: '#ef4444',
    },
    {
      title: 'Revenu généré',
      value: `${totalEarnings.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: '#06b6d4',
    },
  ];

  const FILTER_OPTIONS = [
    'All',
    'draft',
    'in_review',
    'accepted',
    'online',
    'rejected',
    'completed',
    'removed',
  ];

  // Memoized back handler
  const handleBack = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to go back');
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={[{ type: 'stats' }, { type: 'missions' }]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'stats') {
            return (
              <>
                <TouchableOpacity
                  style={[styles.backButton, { backgroundColor: colors.card }]}
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                {/* Header with Gradient */}
                <View style={styles.headerContainer}>
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'CC']}
                    style={styles.gradientHeader}
                  >
                    <Animated.View
                      entering={FadeInUp.delay(200)}
                      style={styles.headerContent}
                    >
                      <View style={styles.headerIcon}>
                        <Target size={32} color="#fff" />
                      </View>
                      <Text style={styles.headerTitle}>
                        Tableau de bord Entrepreneur
                      </Text>
                      <Text style={styles.headerSubtitle}>
                        Gérez vos missions et recrutements
                      </Text>
                    </Animated.View>
                  </LinearGradient>
                </View>
                <SectionHeader title="Statistiques" colors={colors} />
                <View style={styles.statsGrid}>
                  {STATS.map((stat, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeInDown.delay(300 + index * 100)}
                      style={styles.statCardContainer}
                    >
                      <StatCard
                        icon={stat.icon}
                        title={stat.title}
                        value={stat.value}
                        colors={{
                          ...colors,
                          primary: stat.color,
                        }}
                      />
                    </Animated.View>
                  ))}
                </View>
              </>
            );
          } else if (item.type === 'missions') {
            return (
              <>
                <SectionHeader title="Vos Missions" colors={colors} />
                <FilterBar
                  filters={FILTER_OPTIONS}
                  selectedFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
                  colors={colors}
                />
                <Animated.View
                  entering={FadeInDown.delay(600)}
                  style={styles.missionsContainer}
                >
                  {loading ? (
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                      style={styles.loader}
                    />
                  ) : filteredMissions.length > 0 ? (
                    filteredMissions.map((mission, index) => (
                      <Animated.View
                        key={mission.id}
                        entering={FadeInDown.delay(700 + index * 100)}
                      >
                        <ListItem
                          item={{
                            ...mission,
                            location: `${
                              mission.location || 'Lieu non spécifié'
                            }`,
                            needed_actor_amount:
                              mission.needed_actor_amount.toString(),
                          }}
                          index={index}
                          onPress={() => router.push(`/mission/${mission.id}`)}
                          colors={colors}
                        />
                      </Animated.View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Briefcase size={48} color={colors.muted} />
                      <Text
                        style={[styles.emptyStateText, { color: colors.text }]}
                      >
                        Aucune mission trouvée
                      </Text>
                      <Text
                        style={[
                          styles.emptyStateSubtext,
                          { color: colors.muted },
                        ]}
                      >
                        Créez votre première mission pour commencer
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.createButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() => router.push('/new')}
                      >
                        <Text style={styles.createButtonText}>
                          Créer une mission
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Animated.View>
              </>
            );
          }
          return null;
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Pull-to-refresh functionality
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
            title="Actualisation..." // iOS
            titleColor={colors.text} // iOS
            progressBackgroundColor={colors.background} // Android
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  refreshButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 2,
    paddingBottom: 150,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 5,
  },
  statCardContainer: {
    minWidth: (width - 60) / 2,
  },
  missionsContainer: {
    paddingHorizontal: 12,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
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
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
});
