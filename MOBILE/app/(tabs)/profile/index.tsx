import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
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

const { width } = Dimensions.get('window');

const technicianCategories = [
  {
    label: 'Techniciens en Agriculture de Précision',
    value: 'precision_agriculture_technician',
  },
  {
    label: 'Techniciens en Matériel Agricole',
    value: 'agricultural_equipment_technician',
  },
  {
    label: 'Techniciens en Cultures et Sols',
    value: 'crop_and_soil_technician',
  },
  {
    label: 'Techniciens de Recherche et Laboratoire',
    value: 'research_and_laboratory_technician',
  },
  {
    label: 'Techniciens en Élevage et Laitier',
    value: 'livestock_and_airy_technician',
  },
  {
    label: 'Techniciens en Sécurité Alimentaire et Qualité',
    value: 'food_safety_and_quality_technician',
  },
  {
    label: 'Techniciens en Gestion des Ravageurs et Environnement',
    value: 'pest_management_and_environmental_technician',
  },
  {
    label: "Techniciens d'Inspection et Certification",
    value: 'inspection_and_certification_technician',
  },
  {
    label: 'Techniciens en Vente et Support',
    value: 'sales_and_support_technician',
  },
  { label: 'Autre', value: 'other' },
];

const workerCategories = [
  {
    label: 'Ouvriers de Production Végétale',
    value: 'crop_production_worker',
  },
  { label: 'Ouvriers en Élevage', value: 'livestock_worker' },
  { label: 'Ouvriers Mécanisés', value: 'mechanized_worker' },
  { label: 'Ouvriers de Transformation', value: 'processing_worker' },
  { label: 'Ouvriers Spécialisés', value: 'specialized_worker' },
  { label: 'Ouvriers Saisonniers', value: 'seasonal_worker' },
  { label: "Ouvriers d'Entretien", value: 'maintenance_worker' },
  { label: 'Autre', value: 'other' },
];

export default function ProfileScreen() {
  const { colors } = useThemeStore();
  const { fetchProfile, loading, profile, error } = useAuthStore();

  useEffect(() => {
    const fetchUserProfile = async () => {
      await fetchProfile();
    };
    fetchUserProfile();
  }, []);

  const handleRefresh = async () => {
    await fetchProfile();
  };

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

  const translateSpecialization = (value?: string | null) => {
    if (!value) return null;

    const techCategory = technicianCategories.find(
      (cat) => cat.value === value
    );
    if (techCategory) return techCategory.label;

    const workerCategory = workerCategories.find((cat) => cat.value === value);
    if (workerCategory) return workerCategory.label;

    return value;
  };

  const getDashboardRoute = () => {
    if (profile?.super_role === 'admin') {
      return '/profile/dashboard/admin';
    } else {
      switch (profile?.role) {
        case 'entrepreneur':
          return '/profile/dashboard/entrepreneur';
        case 'technician':
          return '/profile/dashboard/technician';
        case 'worker':
          return '/profile/dashboard/worker';
        default:
          return null;
      }
    }
  };

  const formatValue = (value?: string | null | number) => {
    if (value === null || value === undefined) return null;

    const stringValue = String(value)
      .replace(/[\[\]']+/g, '')
      .replace(/([a-z])([A-Z])/g, '$1, $2')
      .trim();

    if (!isNaN(Number(stringValue))) {
      return stringValue;
    }

    return stringValue;
  };

  const renderDetailValue = (
    value?: string | null | number,
    label?: string
  ) => {
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

    if (typeof formattedValue === 'string' && formattedValue.includes(',')) {
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
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient Background */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            style={styles.gradientHeader}
          >
            <TouchableOpacity
              style={[
                styles.refreshButton,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
              onPress={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <RefreshCw size={20} color="#fff" />
              )}
            </TouchableOpacity>

            <Animated.View
              entering={FadeInUp.delay(200)}
              style={styles.profileSection}
            >
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
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push('/profile/edit')}
                >
                  <Edit size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.name}>
                  {profile?.full_name || 'Nom Inconnu'}
                </Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.role}>
                    {profile?.role === 'worker'
                      ? 'Ouvrier'
                      : profile?.role === 'technician'
                      ? 'Technicien'
                      : profile?.role === 'entrepreneur'
                      ? 'Entrepreneur'
                      : 'Inconnu'}
                  </Text>
                </View>
                <View style={styles.locationContainer}>
                  <MapPin size={16} color="#fff" />
                  <Text style={styles.location}>
                    {profile?.actual_location || 'Localisation Inconnue'}
                  </Text>
                </View>
              </View>
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
            onPress={() => {
              const route = getDashboardRoute();
              if (route) {
                router.push(route);
              }
            }}
          >
            <Briefcase size={24} color="#fff" />
            <Text style={styles.dashboardButtonText}>Tableau De Bord</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <ProfileSection
            title="À Propos"
            icon={<Info size={20} color={colors.primary} />}
            details={[
              {
                label: 'Bio',
                value: profile?.bio,
              },
            ]}
            colors={colors}
            renderDetailValue={renderDetailValue}
            delay={300}
          />

          <ProfileSection
            title="Contact"
            icon={<Phone size={20} color={colors.primary} />}
            details={[
              {
                label: 'Téléphone',
                value: profile?.phone,
              },
            ]}
            colors={colors}
            renderDetailValue={renderDetailValue}
            delay={400}
          />

          <ProfileSection
            title="Compétences et Expérience"
            icon={<Briefcase size={20} color={colors.primary} />}
            details={[
              {
                label: 'Compétences',
                value: Array.isArray(profile?.skills)
                  ? profile.skills.join(', ')
                  : profile?.skills,
              },
              {
                label: 'Expérience Professionnelle',
                value: Array.isArray(profile?.work_experience)
                  ? profile.work_experience.join(', ')
                  : profile?.work_experience,
              },
              {
                label: 'Spécialisation',
                value: translateSpecialization(
                  profile?.specialization || profile?.other_specialization
                ),
              },
            ]}
            colors={colors}
            renderDetailValue={renderDetailValue}
            delay={500}
          />

          <ProfileSection
            title="Éducation et Certifications"
            icon={<GraduationCap size={20} color={colors.primary} />}
            details={[
              {
                label: 'Certifications',
                value: Array.isArray(profile?.certifications)
                  ? profile.certifications.join(', ')
                  : profile?.certifications,
              },
            ]}
            colors={colors}
            renderDetailValue={renderDetailValue}
            delay={600}
          />

          <ProfileSection
            title="Langues"
            icon={<Globe size={20} color={colors.primary} />}
            details={[
              {
                label: 'Langues',
                value: Array.isArray(profile?.languages)
                  ? profile.languages.join(', ')
                  : profile?.languages,
              },
            ]}
            colors={colors}
            renderDetailValue={renderDetailValue}
            delay={700}
          />

          <ProfileSection
            title="Portfolio"
            icon={<Folder size={20} color={colors.primary} />}
            details={[
              {
                label: 'Portfolio',
                value: Array.isArray(profile?.portfolio)
                  ? profile.portfolio.join(', ')
                  : profile?.portfolio,
              },
            ]}
            colors={colors}
            renderDetailValue={renderDetailValue}
            delay={800}
          />

          <ProfileSection
            title="Zone de disponibilité"
            icon={<MapPin size={20} color={colors.primary} />}
            details={[
              {
                label: 'Zones',
                value: Array.isArray(profile?.availability_locations)
                  ? profile.availability_locations.join(', ')
                  : profile?.availability_locations,
              },
            ]}
            colors={colors}
            renderDetailValue={renderDetailValue}
            delay={900}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileSection({
  title,
  icon,
  details,
  colors,
  renderDetailValue,
  delay = 0,
}: {
  title: string;
  icon: JSX.Element;
  details: { label: string; value?: string | null }[];
  colors: any;
  renderDetailValue: (value?: string | null, label?: string) => JSX.Element;
  delay?: number;
}) {
  return (
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
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: 60,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    opacity: 0.8,
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
