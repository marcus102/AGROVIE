import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '@/stores/theme';
import {
  Users,
  Star,
  Briefcase,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  DollarSign,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ListItem } from '@/components/ListItem';
import { FilterBar } from '@/components/FilterBar';
import { useMissionStore } from '@/stores/mission';
import { supabase } from '@/lib/supabase';
import { Mission } from '@/types/mission';

export default function EntrepreneurDashboard() {
  const { colors } = useThemeStore();
   const { fetchMissionByUserId } = useMissionStore();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch missions created by this entrepreneur
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
    const fetchUserMissions = async () => {
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

    fetchUserMissions();
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

  // Filter missions based on selected status
  const filteredMissions = missions.filter((mission) => {
    if (selectedFilter === 'All') return true;
    return mission.status === selectedFilter;
  });

  // Calculate statistics
  const totalMissions = missions.length;
  const activeMissions = missions.filter(mission => 
    ['accepted', 'online', 'in_review'].includes(mission.status)
  ).length;
  
  const completedMissions = missions.filter(
    mission => mission.status === 'completed'
  ).length;
  
  // Calculate total applications (sum of applications across all missions)
  const totalApplications = missions.reduce(
    (sum, mission) => sum + (mission.applications?.length || 0),
    0
  );
  
  // Calculate match rate (missions with at least 1 application)
  const matchRate = totalMissions > 0 
    ? Math.round((missions.filter(m => (m.applications?.length || 0) > 0).length / totalMissions) * 100)
    : 0;
  
  // Calculate total earnings (assuming each completed mission earns 5000 FCFA)
  const totalEarnings = completedMissions * 5000; 

  // Entrepreneur-specific stats
  const STATS = [
    {
      title: 'Missions actives',
      value: activeMissions,
      icon: Briefcase,
    },
    {
      title: 'Candidatures',
      value: totalApplications,
      icon: Users,
    },
    {
      title: 'Taux de match',
      value: `${matchRate}%`,
      icon: Star,
    },
    {
      title: 'Missions terminées',
      value: completedMissions,
      icon: CheckCircle2,
    },
    {
      title: 'Recrutements',
      value: completedMissions, // 1 worker per completed mission
      icon: TrendingUp,
    },
    {
      title: 'Revenu généré',
      value: `${totalEarnings.toLocaleString()} FCFA`,
      icon: DollarSign,
    },
  ];

  // Filter options for mission status
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

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: colors.primary }]}
        onPress={handleRefresh}
        disabled={refreshing || loading}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color={colors.card} />
        ) : (
          <RefreshCw size={20} color={colors.card} />
        )}
      </TouchableOpacity>

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
                    <StatCard
                      key={index}
                      icon={stat.icon}
                      title={stat.title}
                      value={stat.value}
                      colors={colors}
                    />
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
                <View>
                  {loading ? (
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                      style={{ marginTop: 20 }}
                    />
                  ) : filteredMissions.length > 0 ? (
                    filteredMissions.map((mission, index) => (
                      <ListItem
                        key={mission.id}
                        item={{
                          ...mission,
                          location: `${mission.location || 'Lieu non spécifié'}`,
                          needed_actor_amount:
                            mission.needed_actor_amount.toString(),
                        }}
                        index={index}
                        onPress={() => router.push(`/mission/${mission.id}`)}
                        colors={colors}
                      />
                    ))
                  ) : (
                    <Text
                      style={{
                        color: colors.text,
                        textAlign: 'center',
                        marginTop: 20,
                        padding: 20,
                      }}
                    >
                      Aucune mission trouvée
                    </Text>
                  )}
                </View>
              </>
            );
          }
          return null;
        }}
        contentContainerStyle={{
          padding: 12,
          backgroundColor: colors.background,
          paddingTop: 60,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});