import React, { useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useThemeStore } from '@/stores/theme';
import { Users, Briefcase, CheckCircle, TrendingUp } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/stores/auth';
import { useMissionStore } from '@/stores/mission';

export default function AdminDashboardScreen() {
  const { colors } = useThemeStore();
  const { profiles, fetchProfiles } = useAuthStore();
  const { missions, fetchMissions } = useMissionStore();

  useEffect(() => {
    const fetchData = async () => {
      await fetchProfiles();
      await fetchMissions();
    };

    fetchData();
  }, [fetchProfiles, fetchMissions]);

  // Calculate statistics from real data
  const totalUsers = profiles.length;
  const activeMissions = missions.filter(
    (mission) => mission.status === 'in_review' || mission.status === 'online'
  ).length;
  const completedMissions = missions.filter(
    (mission) => mission.status === 'completed'
  ).length;
  const successRate =
    completedMissions > 0
      ? (
          (completedMissions / (completedMissions + activeMissions)) *
          100
        ).toFixed(1) + '%'
      : '0%';

  const stats = [
    { title: 'Utilisateurs totaux', value: totalUsers, icon: Users },
    { title: 'Missions actives', value: activeMissions, icon: Briefcase },
    {
      title: 'Missions terminées',
      value: completedMissions,
      icon: CheckCircle,
    },
    { title: 'Taux de succès', value: successRate, icon: TrendingUp },
  ];

  // Calculate user breakdown by role
  const userBreakdown = profiles.reduce(
    (acc: Record<string, number>, profile) => {
      acc[profile.role] = (acc[profile.role] || 0) + 1;
      return acc;
    },
    {}
  );

  // Prepare chart data based on mission creation dates
  const chartData = useMemo(() => {
    // Group missions by month of creation
    const monthlyData = missions.reduce((acc, mission) => {
      if (!mission.created_at) return acc;

      const date = new Date(mission.created_at);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get last 6 months
    const months = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      months.push({
        name: `${monthNames[month]} ${year.toString().slice(2)}`,
        count: monthlyData[key] || 0,
      });
    }

    return {
      labels: months.map((m) => m.name),
      datasets: [
        {
          data: months.map((m) => m.count),
        },
      ],
    };
  }, [missions]);

  const RoleBreakdown = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Répartition des utilisateurs
      </Text>
      {Object.entries(userBreakdown).map(([role, count], index) => (
        <View key={role} style={styles.roleItem}>
          <View style={styles.roleInfo}>
            <Text style={[styles.roleName, { color: colors.text }]}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
            <Text style={[styles.roleCount, { color: colors.primary }]}>
              {count} utilisateurs
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary,
                  width: `${(count / totalUsers) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const EngagementMetrics = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Métriques d'engagement
      </Text>
      <View style={styles.engagementGrid}>
        <View style={styles.engagementItem}>
          <Text style={[styles.engagementValue, { color: colors.text }]}>
            {Math.floor(totalUsers * 0.6)}
          </Text>
          <Text style={[styles.engagementLabel, { color: colors.muted }]}>
            Utilisateurs actifs / jour
          </Text>
        </View>
        <View style={styles.engagementItem}>
          <Text style={[styles.engagementValue, { color: colors.text }]}>
            24m
          </Text>
          <Text style={[styles.engagementLabel, { color: colors.muted }]}>
            Temps moyen / session
          </Text>
        </View>
        <View style={styles.engagementItem}>
          <Text style={[styles.engagementValue, { color: colors.text }]}>
            76%
          </Text>
          <Text style={[styles.engagementLabel, { color: colors.muted }]}>
            Taux de rétention
          </Text>
        </View>
      </View>
    </View>
  );

  const ActivityChart = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Activité des utilisateurs (missions créées)
      </Text>
      <LineChart
        data={chartData}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => colors.primary,
          labelColor: () => colors.text,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );

  return (
    <FlatList
      data={[
        { type: 'stats' },
        { type: 'roleBreakdown' },
        { type: 'engagementMetrics' },
        { type: 'activityChart' },
      ]}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      ListHeaderComponent={
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            margin: 12,
          }}
          onPress={() => Linking.openURL('http://localhost:5173/admin')}
        >
          <Text
            style={{
              color: '#fff',
              fontFamily: 'Inter-SemiBold',
              fontSize: 16,
            }}
          >
            Aller au dashboard web admin
          </Text>
        </TouchableOpacity>
      }
      renderItem={({ item }) => {
        if (item.type === 'stats') {
          return (
            <>
              <SectionHeader title="Statistiques" colors={colors} />
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
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
        } else if (item.type === 'roleBreakdown') {
          return <RoleBreakdown />;
        } else if (item.type === 'engagementMetrics') {
          return <EngagementMetrics />;
        } else if (item.type === 'activityChart') {
          return <ActivityChart />;
        }
        return null;
      }}
      contentContainerStyle={{
        padding: 12,
        backgroundColor: colors.background,
      }}
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
  section: {
    margin: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  roleItem: {
    marginBottom: 16,
  },
  roleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  roleCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  engagementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  engagementItem: {
    alignItems: 'center',
  },
  engagementValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  engagementLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
