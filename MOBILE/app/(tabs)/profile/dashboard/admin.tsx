import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  ScrollView,
  Platform,
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
  FileText,
  Clock,
  AlertCircle,
  BookOpen,
  ArrowLeft,
} from 'lucide-react-native';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/stores/auth';
import { useMissionStore } from '@/stores/mission';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { createClient } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useLinkStore } from '@/stores/dynamic_links';

// Initialize Supabase client with error handling
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;
const MISSION_CARD_HEIGHT = 120;
const BLOG_CARD_HEIGHT = 100;

// Utility function for error handling
const handleError = (error: unknown, context = '') => {
  console.error(`Erreur ${context}:`, error);
  Alert.alert(
    'Erreur',
    `Une erreur s'est produite ${context}. Veuillez réessayer.`
  );
};

// Custom hook for Supabase operations
type BlogPost = {
  id: any;
  images: any;
  title: any;
  reading_time: any;
  theme: any;
  tags: any;
  status: any;
};

const useSupabase = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  const fetchBlogPosts = useCallback(async () => {
    setLoadingBlogs(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      // Simulating supabase call - replace with actual implementation
      const { data, error } = await supabase
        .from('documents')
        .select('id, images, title, reading_time, theme, tags, status')
        .order('title', { ascending: true });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      handleError(error, 'lors du chargement des articles de blog');
      setBlogPosts([]);
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  return { blogPosts, loadingBlogs, fetchBlogPosts };
};

export default function AdminDashboardScreen() {
  const { colors } = useThemeStore();
  const { profiles, fetchProfiles, loading: profilesLoading } = useAuthStore();
  const {
    missions,
    fetchMissions,
    loading: missionsLoading,
  } = useMissionStore();
  const { blogPosts, loadingBlogs, fetchBlogPosts } = useSupabase();

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { links, fetchLinks } = useLinkStore();

  // Memoized calculations for better performance
  const statsData = useMemo(() => {
    const totalUsers = profiles?.length || 0;
    const activeMissions =
      missions?.filter(
        (mission) =>
          mission?.status === 'in_review' || mission?.status === 'online'
      ).length || 0;
    const acceptedMissions =
      missions?.filter(
        (mission) => mission?.status === ('accepted' as typeof mission.status)
      ).length || 0;
    const completedMissions =
      missions?.filter((mission) => mission?.status === 'completed').length ||
      0;
    const publishedBlogs =
      blogPosts?.filter((blog) => blog?.status === 'published').length || 0;

    const successRate =
      completedMissions > 0
        ? (
          (completedMissions / (completedMissions + activeMissions)) *
          100
        ).toFixed(1) + '%'
        : '0%';

    return {
      totalUsers,
      activeMissions,
      acceptedMissions,
      completedMissions,
      publishedBlogs,
      successRate,
    };
  }, [profiles, missions, blogPosts]);

  type Role = 'worker' | 'advisor' | 'entrepreneur' | 'admin';
  type UserBreakdown = Record<Role, number>;

  const userBreakdown = useMemo(() => {
    if (!profiles?.length) return {} as UserBreakdown;
    return profiles.reduce((acc: UserBreakdown, profile) => {
      if (profile?.role) {
        acc[profile.role as Role] = (acc[profile.role as Role] || 0) + 1;
      }
      return acc;
    }, {} as UserBreakdown);
  }, [profiles]);

  const missionActivity = useMemo(() => {
    if (!missions?.length) return { thisWeek: 0, thisMonth: 0 };

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return {
      thisWeek: missions.filter((mission) => {
        if (!mission?.created_at) return false;
        return new Date(mission.created_at) > weekAgo;
      }).length,
      thisMonth: missions.filter((mission) => {
        if (!mission?.created_at) return false;
        return new Date(mission.created_at) > monthAgo;
      }).length,
    };
  }, [missions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      await Promise.all([
        fetchProfiles().catch((err) =>
          handleError(err, 'lors du chargement des profils')
        ),
        fetchMissions().catch((err) =>
          handleError(err, 'lors du chargement des missions')
        ),
        fetchBlogPosts().catch((err) =>
          handleError(err, 'lors du chargement des articles')
        ),
      ]);
    } catch (error) {
      setError('Erreur lors de la mise à jour des données');
      handleError(error, 'lors de la mise à jour');
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfiles, fetchMissions, fetchBlogPosts]);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      fetchLinks();
    };

    initializeApp();
  }, [fetchLinks]);

  const adminPageLink =
    links.find((link) => link.category === 'website-admin')?.link || '/';

  const isLoading = profilesLoading || missionsLoading || loadingBlogs;

  if (
    isLoading &&
    !profiles?.length &&
    !missions?.length &&
    !blogPosts?.length
  ) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement du tableau de bord...
        </Text>
      </View>
    );
  }

  const stats = [
    {
      title: 'Utilisateurs totaux',
      value: statsData.totalUsers,
      icon: Users,
      color: '#3b82f6',
    },
    {
      title: 'Missions actives',
      value: statsData.activeMissions,
      icon: Briefcase,
      color: '#10b981',
    },
    {
      title: 'Missions acceptées',
      value: statsData.acceptedMissions,
      icon: CheckCircle,
      color: '#f59e0b',
    },
    {
      title: 'Missions terminées',
      value: statsData.completedMissions,
      icon: CheckCircle,
      color: '#8b5cf6',
    },
    {
      title: 'Articles publiés',
      value: statsData.publishedBlogs,
      icon: FileText,
      color: '#ef4444',
    },
    {
      title: 'Taux de succès',
      value: statsData.successRate,
      icon: TrendingUp,
      color: '#06b6d4',
    },
  ];

  const MissionsList = React.memo(() => {
    if (!missions?.length) {
      return (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <AlertCircle size={48} color={colors.muted} />
          <Text style={[styles.emptyStateText, { color: colors.muted }]}>
            Aucune mission trouvée
          </Text>
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.delay(1200)}
        style={[styles.section, { backgroundColor: colors.card }]}
      >
        <View style={styles.sectionHeaderWithIcon}>
          <View
            style={[
              styles.sectionIcon,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Briefcase size={24} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Toutes les missions ({missions.length})
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {missions.slice(0, 10).map((mission, index) => (
            <Animated.View
              key={mission.id}
              entering={FadeInDown.delay(1300 + index * 50)}
              style={[
                styles.missionCard,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(mission.status) + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: getStatusColor(mission.status),
                    },
                  ]}
                >
                  {getStatusLabel(mission.status)}
                </Text>
              </View>
              <Text
                style={[styles.missionTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {mission.mission_title || 'Mission sans titre'}
              </Text>
              <Text style={[styles.missionDate, { color: colors.muted }]}>
                {mission.created_at
                  ? new Date(mission.created_at).toLocaleDateString('fr-FR')
                  : 'Date inconnue'}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>

        {missions.length > 10 && (
          <TouchableOpacity
            style={[styles.viewAllButton, { borderColor: colors.primary }]}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              Voir toutes les missions ({missions.length})
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  });

  const AcceptedMissionsList = React.memo(() => {
    const acceptedMissions =
      missions?.filter((m) => m?.status === 'accepted') || [];

    if (!acceptedMissions.length) {
      return (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <CheckCircle size={48} color={colors.muted} />
          <Text style={[styles.emptyStateText, { color: colors.muted }]}>
            Aucune mission acceptée
          </Text>
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.delay(1400)}
        style={[styles.section, { backgroundColor: colors.card }]}
      >
        <View style={styles.sectionHeaderWithIcon}>
          <View
            style={[styles.sectionIcon, { backgroundColor: '#10b981' + '15' }]}
          >
            <CheckCircle size={24} color="#10b981" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Missions acceptées ({acceptedMissions.length})
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {acceptedMissions.slice(0, 10).map((mission, index) => (
            <Animated.View
              key={mission.id}
              entering={FadeInDown.delay(1500 + index * 50)}
              style={[
                styles.missionCard,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: '#10b981' + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: '#10b981' }]}>
                  Acceptée
                </Text>
              </View>
              <Text
                style={[styles.missionTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {mission.mission_title || 'Mission sans titre'}
              </Text>
              <Text style={[styles.missionDate, { color: colors.muted }]}>
                {mission.created_at
                  ? new Date(mission.created_at).toLocaleDateString('fr-FR')
                  : 'Date inconnue'}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  });

  const BlogPostsList = React.memo(() => {
    if (!blogPosts?.length) {
      return (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <BookOpen size={48} color={colors.muted} />
          <Text style={[styles.emptyStateText, { color: colors.muted }]}>
            Aucun article de blog trouvé
          </Text>
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.delay(1600)}
        style={[styles.section, { backgroundColor: colors.card }]}
      >
        <View style={styles.sectionHeaderWithIcon}>
          <View
            style={[styles.sectionIcon, { backgroundColor: '#ef4444' + '15' }]}
          >
            <FileText size={24} color="#ef4444" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Articles de blog ({blogPosts.length})
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {blogPosts.slice(0, 10).map((blog, index) => (
            <Animated.View
              key={blog.id}
              entering={FadeInDown.delay(1700 + index * 50)}
              style={[styles.blogCard, { backgroundColor: colors.background }]}
            >
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      blog.status === 'published'
                        ? '#10b981' + '20'
                        : '#f59e0b' + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        blog.status === 'published' ? '#10b981' : '#f59e0b',
                    },
                  ]}
                >
                  {blog.status === 'published' ? 'Publié' : 'Brouillon'}
                </Text>
              </View>
              <Text
                style={[styles.blogTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {blog.title || 'Article sans titre'}
              </Text>
              <View style={styles.blogMeta}>
                <View style={styles.blogMetaItem}>
                  <Clock size={12} color={colors.muted} />
                  <Text style={[styles.blogMetaText, { color: colors.muted }]}>
                    {blog.reading_time || '0'} min
                  </Text>
                </View>
                {blog.theme && (
                  <View
                    style={[
                      styles.themeBadge,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Text style={[styles.themeText, { color: colors.primary }]}>
                      {blog.theme}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {blogPosts.length > 10 && (
          <TouchableOpacity
            style={[styles.viewAllButton, { borderColor: colors.primary }]}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              Voir tous les articles ({blogPosts.length})
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  });

  const RoleBreakdown = React.memo(() => (
    <Animated.View
      entering={FadeInDown.delay(600)}
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeaderWithIcon}>
        <View
          style={[
            styles.sectionIcon,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <Users size={24} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Répartition des utilisateurs
        </Text>
      </View>
      {Object.entries(userBreakdown).length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.muted }]}>
            Aucun utilisateur trouvé
          </Text>
        </View>
      ) : (
        Object.entries(userBreakdown).map(([role, count], index) => (
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
                {count} utilisateur{count > 1 ? 's' : ''}
              </Text>
            </View>
            <View
              style={[
                styles.progressBarContainer,
                { backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: colors.primary,
                    width: `${statsData.totalUsers > 0
                      ? (count / statsData.totalUsers) * 100
                      : 0
                      }%`,
                  },
                ]}
              />
            </View>
          </Animated.View>
        ))
      )}
    </Animated.View>
  ));

  const EngagementMetrics = React.memo(() => (
    <Animated.View
      entering={FadeInDown.delay(800)}
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeaderWithIcon}>
        <View
          style={[styles.sectionIcon, { backgroundColor: '#10b981' + '15' }]}
        >
          <BarChart3 size={24} color="#10b981" />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Métriques d'engagement
        </Text>
      </View>
      <View style={styles.engagementGrid}>
        <View style={styles.engagementItem}>
          <Text style={[styles.engagementValue, { color: colors.text }]}>
            {Math.floor(statsData.totalUsers * 0.6)}
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
  ));

  const ActivitySummary = React.memo(() => (
    <Animated.View
      entering={FadeInDown.delay(1000)}
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <View style={styles.sectionHeaderWithIcon}>
        <View
          style={[styles.sectionIcon, { backgroundColor: '#8b5cf6' + '15' }]}
        >
          <TrendingUp size={24} color="#8b5cf6" />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Activité récente
        </Text>
      </View>
      <View style={styles.activityGrid}>
        <View style={styles.activityItem}>
          <Text style={[styles.activityValue, { color: colors.text }]}>
            {missionActivity.thisWeek}
          </Text>
          <Text style={[styles.activityLabel, { color: colors.muted }]}>
            Missions cette semaine
          </Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={[styles.activityValue, { color: colors.text }]}>
            {missionActivity.thisMonth}
          </Text>
          <Text style={[styles.activityLabel, { color: colors.muted }]}>
            Missions ce mois
          </Text>
        </View>
      </View>
      <View
        style={[styles.activityIndicator, { backgroundColor: colors.border }]}
      >
        <View
          style={[
            styles.activityProgress,
            {
              backgroundColor: '#8b5cf6',
              width: `${Math.min(
                (missionActivity.thisWeek /
                  Math.max(missionActivity.thisMonth, 1)) *
                100,
                100
              )}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.activityDescription, { color: colors.muted }]}>
        Progression hebdomadaire par rapport au mois
      </Text>
    </Animated.View>
  ));

  const renderItem = useCallback(
    ({ item }: { item: { type: string } }) => {
      switch (item.type) {
        case 'webButton':
          return (
            <>
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

                  <Animated.View
                    entering={FadeInUp.delay(200)}
                    style={styles.headerContent}
                  >
                    <View style={styles.headerIcon}>
                      <Shield size={32} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>
                      Tableau de bord Admin
                    </Text>
                    <Text style={styles.headerSubtitle}>
                      Vue d'ensemble de la plateforme
                    </Text>
                  </Animated.View>
                </LinearGradient>
              </View>
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={styles.webButtonContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.webButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => Linking.openURL(adminPageLink)}
                >
                  <Globe size={24} color="#fff" />
                  <Text style={styles.webButtonText}>
                    Tableau de bord Web Admin
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          );
        case 'stats':
          return (
            <>
              <SectionHeader title="Statistiques générales" colors={colors} />
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
                      colors={{ ...colors, primary: stat.color }}
                    />
                  </Animated.View>
                ))}
              </View>
            </>
          );
        case 'roleBreakdown':
          return <RoleBreakdown />;
        case 'engagementMetrics':
          return <EngagementMetrics />;
        case 'activitySummary':
          return <ActivitySummary />;
        case 'missionsList':
          return <MissionsList />;
        case 'acceptedMissions':
          return <AcceptedMissionsList />;
        case 'blogPosts':
          return <BlogPostsList />;
        default:
          return null;
      }
    },
    [
      colors,
      refreshing,
      handleRefresh,
      stats,
      statsData,
      userBreakdown,
      missionActivity,
      missions,
      blogPosts,
    ]
  );

  const data = [
    { type: 'webButton' },
    { type: 'stats' },
    { type: 'roleBreakdown' },
    { type: 'engagementMetrics' },
    { type: 'activitySummary' },
    { type: 'missionsList' },
    { type: 'acceptedMissions' },
    { type: 'blogPosts' },
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
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>
      {error && (
        <View
          style={[styles.errorBanner, { backgroundColor: '#ef4444' + '20' }]}
        >
          <AlertCircle size={16} color="#ef4444" />
          <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={10}
        initialNumToRender={3}
        getItemLayout={(data, index) => ({
          length: 300, // Estimated item height
          offset: 300 * index,
          index,
        })}
      />
    </View>
  );
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'accepted':
      return '#3b82f6';
    case 'in_review':
      return '#f59e0b';
    case 'online':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Terminée';
    case 'accepted':
      return 'Acceptée';
    case 'in_review':
      return 'En révision';
    case 'online':
      return 'En ligne';
    default:
      return status || 'Inconnu';
  }
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
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
    paddingHorizontal: 2,
    paddingBottom: 150,
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
    minWidth: CARD_WIDTH,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  // Role breakdown styles
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
  // Engagement metrics styles
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
  // Activity summary styles
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  activityItem: {
    alignItems: 'center',
    flex: 1,
  },
  activityValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  activityLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  activityIndicator: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  activityProgress: {
    height: '100%',
    borderRadius: 4,
  },
  activityDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Horizontal list styles
  horizontalList: {
    paddingHorizontal: 4,
    gap: 12,
  },
  // Mission card styles
  missionCard: {
    width: width * 0.7,
    height: MISSION_CARD_HEIGHT,
    padding: 16,
    borderRadius: 16,
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  missionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
  missionDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 'auto',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Blog card styles
  blogCard: {
    width: width * 0.75,
    height: BLOG_CARD_HEIGHT,
    padding: 16,
    borderRadius: 16,
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  blogTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  blogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  blogMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blogMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  themeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  themeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  // View all button styles
  viewAllButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
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
