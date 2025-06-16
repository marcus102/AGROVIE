import React, { useEffect, useMemo, useState } from 'react';
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
  Users,
  Briefcase,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Shield,
  Globe,
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/stores/auth';
import { useMissionStore } from '@/stores/mission';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const { colors } = useThemeStore();
  const { profiles, fetchProfiles } = useAuthStore();
  const { missions, fetchMissions } = useMissionStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProfiles();
      await fetchMissions();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setRefreshing(true);
      try {
        await fetchProfiles();
        await fetchMissions();
      } finally {
        setRefreshing(false);
      }
    };

    fetchData();
  }, [fetchProfiles, fetchMissions]);

  if (refreshing && profiles.length === 0 && missions.length === 0) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
    { title: 'Utilisateurs totaux', value: totalUsers, icon: Users, color: '#3b82f6' },
    { title: 'Missions actives', value: activeMissions, icon: Briefcase, color: '#10b981' },
    { title: 'Missions terminées', value: completedMissions, icon: CheckCircle, color: '#f59e0b' },
    { title: 'Taux de succès', value: successRate, icon: TrendingUp, color: '#8b5cf6' },
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
    const monthlyData = missions.reduce((acc, mission) => {
      if (!mission.created_at) return acc;

      const date = new Date(mission.created_at);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const months = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      months.push({
        name: `${monthNames[month]}`,
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
    <Animated.View 
      entering={FadeInDown.delay(600)} 
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeaderWithIcon}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
          <Users size={24} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Répartition des utilisateurs
        </Text>
      </View>
      {Object.entries(userBreakdown).map(([role, count], index) => (
        <Animated.View 
          key={role} 
          entering={FadeInDown.delay(700 + index * 100)}
          style={styles.roleItem}
        >
          <View style={styles.roleInfo}>
            <Text style={[styles.roleName, { color: colors.text }]}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
            <Text style={[styles.roleCount, { color: colors.primary }]}>
              {count} utilisateurs
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
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
        </Animated.View>
      ))}
    </Animated.View>
  );

  const EngagementMetrics = () => (
    <Animated.View 
      entering={FadeInDown.delay(800)} 
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeaderWithIcon}>
        <View style={[styles.sectionIcon, { backgroundColor: '#10b981' + '15' }]}>
          <BarChart3 size={24} color="#10b981" />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Métriques d'engagement
        </Text>
      </View>
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
    </Animated.View>
  );

  const ActivityChart = () => (
    <Animated.View 
      entering={FadeInDown.delay(1000)} 
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeaderWithIcon}>
        <View style={[styles.sectionIcon, { backgroundColor: '#8b5cf6' + '15' }]}>
          <TrendingUp size={24} color="#8b5cf6" />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Activité des utilisateurs
        </Text>
      </View>
      <LineChart
        data={chartData}
        width={width - 80}
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
    </Animated.View>
  );

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
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Shield size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Dashboard Admin</Text>
            <Text style={styles.headerSubtitle}>
              Vue d'ensemble de la plateforme
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>

      <FlatList
        data={[
          { type: 'webButton' },
          { type: 'stats' },
          { type: 'roleBreakdown' },
          { type: 'engagementMetrics' },
          { type: 'activityChart' },
        ]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'webButton') {
            return (
              <Animated.View entering={FadeInDown.delay(300)} style={styles.webButtonContainer}>
                <TouchableOpacity
                  style={[styles.webButton, { backgroundColor: colors.primary }]}
                  onPress={() => Linking.openURL('http://localhost:5173/admin')}
                >
                  <Globe size={24} color="#fff" />
                  <Text style={styles.webButtonText}>
                    Dashboard Web Admin
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          } else if (item.type === 'stats') {
            return (
              <>
                <SectionHeader title="Statistiques" colors={colors} />
                <View style={styles.statsGrid}>
                  {stats.map((stat, index) => (
                    <Animated.View 
                      key={index}
                      entering={FadeInDown.delay(400 + index * 100)}
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
          } else if (item.type === 'roleBreakdown') {
            return <RoleBreakdown />;
          } else if (item.type === 'engagementMetrics') {
            return <EngagementMetrics />;
          } else if (item.type === 'activityChart') {
            return <ActivityChart />;
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    fontSize: 28,
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
  webButtonContainer: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  webButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  webButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
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
  section: {
    margin: 12,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  roleItem: {
    marginBottom: 20,
  },
  roleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  roleCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  progressBarContainer: {
    height: 8,
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
    flex: 1,
  },
  engagementValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 8,
  },
  engagementLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});