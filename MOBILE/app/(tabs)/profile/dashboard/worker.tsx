import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useThemeStore } from '@/stores/theme';
import { Briefcase, CheckCircle2, Star, DollarSign, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ListItem } from '@/components/ListItem';
import { FilterBar } from '@/components/FilterBar';
import { useMissionStore } from '@/stores/mission';
import { supabase } from '@/lib/supabase';
import { Mission } from '@/types/mission';

export default function WorkerDashboard() {
  const { colors } = useThemeStore();
  const { fetchMissionByUserId } = useMissionStore();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter missions based on the selected filter
  const filteredMissions = missions.filter((mission) => {
    if (selectedFilter === 'All') return true;
    return mission.status === selectedFilter;
  });

  // Define stats
  const STATS = [
    {
      title: 'Note',
      value: '4.5/5', // Replace with dynamic value if available
      icon: Star,
    },
    {
      title: 'Missions',
      value: missions.length, // Total missions created
      icon: Briefcase,
    },
    {
      title: 'Succès',
      value: missions.filter((mission) => mission.status === 'completed').length, // Successful missions
      icon: CheckCircle2,
    },
    {
      title: 'Candidatures',
      value: '0', // Replace with dynamic value if available
      icon: Briefcase,
    },
    {
      title: 'Dépenses',
      value: '0.00 FCFA', // Replace with dynamic value if available
      icon: DollarSign,
    },
    {
      title: 'Revenu',
      value: '0.00 FCFA', // Replace with dynamic value if available
      icon: TrendingUp,
    },
  ];

  return (
    <FlatList
      data={[{ type: 'stats' }, { type: 'missions' }]} // Define sections
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
              <SectionHeader title="Missions" colors={colors} />
              <FilterBar
                filters={['All', 'in_review', 'accepted', 'online', 'rejected', 'completed', 'removed']}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                colors={colors}
              />
              <View>
                {loading ? (
                  <Text
                    style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}
                  >
                    Loading missions...
                  </Text>
                ) : Array.isArray(filteredMissions) && filteredMissions.length > 0 ? (
                  filteredMissions.map((mission, index) => (
                    <ListItem
                      key={mission.id}
                      item={{
                        ...mission,
                        location: `${mission.location || 'Unknown Location'}`,
                        needed_actor_amount: mission.needed_actor_amount.toString(),
                      }}
                      index={index}
                      onPress={() => router.push(`/mission/${mission.id}`)}
                      colors={colors}
                    />
                  ))
                ) : (
                  <Text
                    style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}
                  >
                    No missions found.
                  </Text>
                )}
              </View>
            </>
          );
        }
        return null;
      }}
      contentContainerStyle={{ padding: 12, backgroundColor: colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
});
