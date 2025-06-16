import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useThemeStore } from '@/stores/theme';
import {
  Briefcase,
  CheckCircle2,
  Star,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Users,
  Clock,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ListItem } from '@/components/ListItem';
import { FilterBar } from '@/components/FilterBar';
import { useMissionStore } from '@/stores/mission';
import { supabase } from '@/lib/supabase';
import { Mission } from '@/types/mission';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WorkerDashboard() {
  const { colors } = useThemeStore();
  const { fetchMissionByUserId } = useMissionStore();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMissions = async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await fetchMissionByUserId(userId);

      if (error) {
        throw new Error(error.message);
      }
      setMissions(data || []);
    } catch (error: any) {
      console.error('Error fetching missions:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAuthenticatedUserMissions = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error('Error fetching user:', error?.message);
          return;
        }

        await fetchMissions(user.id);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchAuthenticatedUserMissions();
  }, []);

  const handleRefresh = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!user) return;

    setRefreshing(true);
    try {
      await fetchMissions(user.id);
    } catch (error) {
      console.error('Error refreshing missions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredMissions = missions.filter((mission) => {
    if (selectedFilter === 'All') return true;
    return mission.status === selectedFilter;
  });

  const completedMissions = missions.filter(
    (mission) => mission.status === 'completed'
  ).length;

  const STATS = [
    {
      title: 'Note',
      value: '4.5/5',
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
      title: 'Succès',
      value: completedMissions,
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      title: 'Candidatures',
      value: '0',
      icon: Users,
      color: '#8b5cf6',
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header with Gradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.gradientHeader}
        >
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={20} color="#fff" />
            )}
          </TouchableOpacity>

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

      <FlatList
        data={[{ type: 'stats' }, { type: 'missions' }]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'stats') {
            return (
              <>
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
                      <TouchableOpacity
                        style={[
                          styles.exploreButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() => router.push('/new')}
                      >
                        <Text style={styles.exploreButtonText}>
                          Explorer les opportunités
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 5,
  },
  statCardContainer: {
    minWidth: (width - 60) /2,
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
});
