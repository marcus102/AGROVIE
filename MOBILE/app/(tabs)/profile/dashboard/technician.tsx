import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useThemeStore } from '@/stores/theme';
import { Wrench, CheckCircle2, Star, Clock } from 'lucide-react-native';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';

const mockData = {
  stats: [
    { title: 'Projets actifs', value: 3, icon: Wrench },
    { title: 'Projets terminés', value: 48, icon: CheckCircle2 },
    { title: 'Note moyenne', value: '4.8/5', icon: Star },
    { title: 'Heures de travail', value: 960, icon: Clock },
  ],
};

export default function TechnicianDashboard() {
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