import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useThemeStore } from '@/stores/theme';
import { Users, Star, Briefcase, TrendingUp } from 'lucide-react-native';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';

const mockData = {
  stats: [
    { title: 'Missions actives', value: 12, icon: Briefcase },
    { title: 'Candidatures', value: 156, icon: Users },
    { title: 'Taux de match', value: '85%', icon: Star },
    { title: 'Recrutements', value: 48, icon: TrendingUp },
  ],
};

export default function EntrepreneurDashboard() {
  const { colors } = useThemeStore();

  return (
    <FlatList
      data={[{ type: 'stats' }]} // Add more sections if needed
      keyExtractor={(item, index) => `${item.type}-${index}`}
      renderItem={({ item }) => {
        if (item.type === 'stats') {
          return (
            <>
              <SectionHeader title="Statistiques" colors={colors} />
              <View style={styles.statsGrid}>
                {mockData.stats.map((stat, index) => (
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