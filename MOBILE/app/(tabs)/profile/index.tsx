import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import {
  MapPin,
  FileEdit as Edit,
  User,
  Briefcase,
  GraduationCap,
  Globe,
  Folder,
  RefreshCw,
  Info,
  Phone,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  advisorSpecializations,
  workerSpecializations,
} from '@/constants/specializations';

// Create lookup maps for O(1) access
const CATEGORY_MAP = new Map<string, string>([
  ...advisorSpecializations.map(
    (cat) => [cat.value, cat.label] as [string, string]
  ),
  ...workerSpecializations.map(
    (cat) => [cat.value, cat.label] as [string, string]
  ),
]);

const ROLE_TRANSLATIONS = {
  worker: 'Ouvrier',
  advisor: 'Conseiller Agricole',
  entrepreneur: 'Entrepreneur',
};

// Memoized components
type ProfileImageProps = {
  profile: any;
  onEditPress: () => void;
};

const ProfileImage = React.memo(
  ({ profile, onEditPress }: ProfileImageProps) => (
    <View style={styles.profileImageContainer}>
      {profile?.profile_picture ? (
        <Image
          source={{ uri: profile.profile_picture }}
          style={styles.profileImage}
        />
      ) : (
        <View
          style={[
            styles.userIconContainer,
            { backgroundColor: 'rgba(255,255,255,0.2)' },
          ]}
        >
          <User size={50} color="#fff" />
        </View>
      )}
      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Edit size={16} color="#4A90E2" />
      </TouchableOpacity>
    </View>
  )
);

type RoleType = keyof typeof ROLE_TRANSLATIONS;

type ProfileInfoProps = {
  profile: {
    full_name?: string;
    role?: RoleType | 'admin';
    actual_location?: string | null;
    [key: string]: any;
  } | null;
};

const ProfileInfo = React.memo(({ profile }: ProfileInfoProps) => (
  <View style={styles.profileInfo}>
    <Text style={styles.name}>{profile?.full_name || 'Nom Inconnu'}</Text>
    <View style={styles.roleBadge}>
      <Text style={styles.role}>
        {ROLE_TRANSLATIONS[profile?.role as RoleType] || 'Inconnu'}
      </Text>
    </View>
    <View style={styles.locationContainer}>
      <MapPin size={16} color="#fff" />
      <Text style={styles.location}>
        {profile?.actual_location || 'Localisation Inconnue'}
      </Text>
    </View>
  </View>
));

type ProfileSectionProps = {
  title: string;
  icon: React.ReactNode;
  details: { label: string; value: any }[];
  colors: {
    card: string;
    primary: string;
    text: string;
    muted: string;
    border: string;
    [key: string]: string;
  };
  renderDetailValue: (value: any, label: string) => React.ReactNode;
  delay?: number;
};

const ProfileSection = React.memo(
  ({
    title,
    icon,
    details,
    colors,
    renderDetailValue,
    delay = 0,
  }: ProfileSectionProps) => (
    <Animated.View
      entering={FadeInDown.delay(delay)}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          {icon}
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {title}
          </Text>
        </View>
      </View>
      <View style={styles.detailsContent}>
        {details.map((detail, index) => (
          <View
            key={index}
            style={[
              styles.detailItem,
              index === details.length - 1
                ? styles.lastDetailItem
                : { borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.detailLabel, { color: colors.muted }]}>
              {detail.label}
            </Text>
            {renderDetailValue(detail.value, detail.label)}
          </View>
        ))}
      </View>
    </Animated.View>
  )
);

export default function ProfileScreen() {
  const { colors } = useThemeStore();
  const { fetchProfile, loading, profile, error } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile]);

  const handleEditPress = useCallback(() => {
    router.push('/profile/edit');
  }, []);

  const translateSpecialization = useCallback((value: string) => {
    if (!value) return null;
    return CATEGORY_MAP.get(value) || value;
  }, []);

  const getDashboardRoute = useCallback(() => {
    if (profile?.super_role === 'admin') {
      return '/profile/dashboard/admin';
    }

    const routes = {
      entrepreneur: '/profile/dashboard/entrepreneur',
      advisor: '/profile/dashboard/advisor',
      worker: '/profile/dashboard/worker',
    };

    return profile?.role && routes[profile.role as keyof typeof routes]
      ? routes[profile.role as keyof typeof routes]
      : null;
  }, [profile?.super_role, profile?.role]);

  const formatValue = useCallback((value: any) => {
    if (value === null || value === undefined) return null;

    const stringValue = String(value)
      .replace(/[\[\]']+/g, '')
      .replace(/([a-z])([A-Z])/g, '$1, $2')
      .trim();

    return stringValue || null;
  }, []);

  const renderDetailValue = useCallback(
    (value: any, label: string) => {
      const formattedValue = formatValue(value);

      if (!formattedValue) {
        return (
          <Text style={[styles.emptyValue, { color: colors.muted }]}>
            Non Disponible
          </Text>
        );
      }

      if (
        label === 'Expérience Professionnelle' &&
        !isNaN(Number(formattedValue))
      ) {
        return (
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formattedValue} ans d'expérience
          </Text>
        );
      }

      if (formattedValue.includes(',')) {
        return (
          <View style={styles.tagsContainer}>
            {formattedValue.split(',').map((item, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {item.trim()}
                </Text>
              </View>
            ))}
          </View>
        );
      }

      return (
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {formattedValue}
        </Text>
      );
    },
    [colors, formatValue]
  );

  const handleDashboardPress = useCallback(() => {
    const route = getDashboardRoute();
    if (route) {
      router.push(route as Parameters<typeof router.push>[0]);
    }
  }, [getDashboardRoute]);

  // Memoize profile sections data
  const profileSections = useMemo(() => {
    if (!profile) return [];

    const joinArrayValue = (arr: any) =>
      Array.isArray(arr) ? arr.join(', ') : arr;

    return [
      {
        title: 'À Propos',
        icon: <Info size={20} color={colors.primary} />,
        details: [{ label: 'Bio', value: profile.bio }],
        delay: 300,
      },
      {
        title: 'Contact',
        icon: <Phone size={20} color={colors.primary} />,
        details: [{ label: 'Téléphone', value: profile.phone }],
        delay: 400,
      },
      {
        title: 'Compétences et Expérience',
        icon: <Briefcase size={20} color={colors.primary} />,
        details: [
          { label: 'Compétences', value: joinArrayValue(profile.skills) },
          {
            label: 'Expérience Professionnelle',
            value: joinArrayValue(profile.work_experience),
          },
          {
            label: 'Spécialisation',
            value: translateSpecialization(
              profile.specialization || profile.other_specialization
            ),
          },
        ],
        delay: 500,
      },
      {
        title: 'Éducation et Certifications',
        icon: <GraduationCap size={20} color={colors.primary} />,
        details: [
          {
            label: 'Certifications',
            value: joinArrayValue(profile.certifications),
          },
        ],
        delay: 600,
      },
      {
        title: 'Langues',
        icon: <Globe size={20} color={colors.primary} />,
        details: [
          { label: 'Langues', value: joinArrayValue(profile.languages) },
        ],
        delay: 700,
      },
      {
        title: 'Portfolio',
        icon: <Folder size={20} color={colors.primary} />,
        details: [
          { label: 'Portfolio', value: joinArrayValue(profile.portfolio) },
        ],
        delay: 800,
      },
      {
        title: 'Zone de disponibilité',
        icon: <MapPin size={20} color={colors.primary} />,
        details: [
          {
            label: 'Zones',
            value: joinArrayValue(profile.availability_locations),
          },
        ],
        delay: 900,
      },
    ];
  }, [profile, colors.primary, translateSpecialization]);

  if (loading && !profile) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
            title="Actualisation..." // iOS
            titleColor={colors.text} // iOS
            progressBackgroundColor={colors.card} // Android
          />
        }
      >
        {/* Header with Gradient Background */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            style={styles.gradientHeader}
          >

            <Animated.View
              entering={FadeInUp.delay(200)}
              style={styles.profileSection}
            >
              <ProfileImage profile={profile} onEditPress={handleEditPress} />
              <ProfileInfo profile={profile } />
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Dashboard Button */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.dashboardSection}
        >
          <TouchableOpacity
            style={[
              styles.dashboardButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleDashboardPress}
          >
            <Briefcase size={24} color="#fff" />
            <Text style={styles.dashboardButtonText}>Tableau De Bord</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          {profileSections.map((section, index) => (
            <ProfileSection
              key={index}
              title={section.title}
              icon={section.icon}
              details={section.details}
              colors={colors}
              renderDetailValue={renderDetailValue}
              delay={section.delay}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 80,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: 10,
    paddingBottom: 30,
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
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  userIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  role: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    opacity: 0.9,
  },
  dashboardSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  detailsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  detailsContent: {
    gap: 16,
  },
  detailItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  lastDetailItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  emptyValue: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});