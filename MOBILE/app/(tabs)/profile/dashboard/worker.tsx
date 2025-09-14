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
  Briefcase,
  Star,
  TrendingUp,
  ArrowLeft,
  Users,
  Clock,
} from 'lucide-react-native';
import { router, Link } from 'expo-router';
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

export default function WorkerDashboard() {
  const { colors } = useThemeStore();
  const { fetchMissionByUserId } = useMissionStore();
  const { fetchAverageUserRating, userAverageRating } = useRatingStore();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  const handleRefresh = async () => {
    if (!userId) return;

    setRefreshing(true);
    try {
      // Refresh both missions and ratings data
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

  // Pull-to-refresh handler (same as handleRefresh but for the FlatList)
  const onRefresh = async () => {
    await handleRefresh();
  };

  const filteredMissions = missions.filter((mission) => {
    if (selectedFilter === 'All') return true;
    return mission.status === selectedFilter;
  });

  const completedMissions = missions.filter(
    (mission) => mission.status === 'completed'
  ).length;

  // Format averageRating for display
  const ratingDisplay =
    typeof userAverageRating === 'number' && !isNaN(userAverageRating)
      ? userAverageRating.toFixed(1)
      : 'N/A';

  const STATS = [
    {
      title: 'Note',
      value: ratingDisplay,
      icon: Star,
      color: '#f59e0b',
    },
    {
      title: 'Missions',
      value: missions.length,
      icon: Briefcase,
      color: '#3b82f6',
    },
    {
      title: 'Heures travaillées',
      value: completedMissions * 8,
      icon: Clock,
      color: '#ef4444',
    },
    {
      title: 'Revenu',
      value: `${(completedMissions * 2500).toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: '#06b6d4',
    },
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
                        <Users size={32} color="#fff" />
                      </View>
                      <Text style={styles.headerTitle}>Dashboard Ouvrier</Text>
                      <Text style={styles.headerSubtitle}>
                        Suivez votre activité professionnelle
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
                <SectionHeader title="Missions" colors={colors} />
                <FilterBar
                  filters={[
                    'All',
                    'in_review',
                    'accepted',
                    'online',
                    'rejected',
                    'completed',
                    'removed',
                  ]}
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
                  ) : Array.isArray(filteredMissions) &&
                    filteredMissions.length > 0 ? (
                    filteredMissions.map((mission, index) => (
                      <Animated.View
                        key={mission.id}
                        entering={FadeInDown.delay(700 + index * 100)}
                      >
                        <ListItem
                          item={{
                            ...mission,
                            location: `${
                              mission.location || 'Unknown Location'
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
                        Commencez à postuler pour des missions
                      </Text>

                      <Link href="/" asChild>
                        <TouchableOpacity
                          style={[
                            styles.exploreButton,
                            { backgroundColor: colors.primary },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.exploreButtonText}>
                            Explorer les opportunités
                          </Text>
                        </TouchableOpacity>
                      </Link>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Actualisation..."
            titleColor={colors.text}
            progressBackgroundColor={colors.background}
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
  exploreButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  exploreButtonText: {
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
