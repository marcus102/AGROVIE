import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  MapPin,
  Edit,
  User,
  Briefcase,
  GraduationCap,
  Globe,
  Folder,
  RefreshCw,
  Info,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';

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
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const translateSpecialization = (value?: string | null) => {
    if (!value) return null;

    // Check technician categories
    const techCategory = technicianCategories.find(
      (cat) => cat.value === value
    );
    if (techCategory) return techCategory.label;

    // Check worker categories
    const workerCategory = workerCategories.find((cat) => cat.value === value);
    if (workerCategory) return workerCategory.label;

    // Return original value if not found in categories
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

    // Convert to string and clean up
    const stringValue = String(value)
      .replace(/[\[\]']+/g, '') // Remove brackets
      .replace(/([a-z])([A-Z])/g, '$1, $2') // Split camelCase
      .trim();

    // Special handling for experience numbers
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

    // Handle empty values
    if (!formattedValue) {
      return (
        <Text style={[styles.emptyValue, { color: colors.muted }]}>
          Non Disponible
        </Text>
      );
    }

    // Special handling for professional experience
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

    // Handle array-like values
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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <RefreshCw size={20} color={colors.card} />
            )}
          </TouchableOpacity>

          <View style={styles.headerContent}>
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
                    { backgroundColor: colors.muted },
                  ]}
                >
                  <User size={50} color={colors.card} />
                </View>
              )}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/profile/edit')}
              >
                <Edit size={20} color={colors.card} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: colors.text }]}>
                {profile?.full_name || 'Nom Inconnu'}
              </Text>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Text style={[styles.role, { color: colors.primary }]}>
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
                <MapPin size={16} color={colors.muted} />
                <Text style={[styles.location, { color: colors.muted }]}>
                  {profile?.actual_location || 'Localisation Inconnue'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dashboard Button */}
        <View style={styles.footer}>
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
            <Text style={[styles.dashboardButtonText, { color: colors.card }]}>
              Tableau De Bord
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Details Section */}
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
}: {
  title: string;
  icon: JSX.Element;
  details: { label: string; value?: string | null }[];
  colors: any;
  renderDetailValue: (value?: string | null, label?: string) => JSX.Element;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '20' },
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
              index === details.length - 1 ? styles.lastDetailItem : null,
            ]}
          >
            <Text style={[styles.detailLabel, { color: colors.muted }]}>
              {detail.label}
            </Text>
            {renderDetailValue(detail.value, detail.label)}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 6,
    fontSize: 14,
  },
  detailsContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsContent: {
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.8,
  },
  footer: {
    padding: 24,
    paddingTop: 0,
    marginTop: 10,
  },
  dashboardButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    flexShrink: 1,
  },
  emptyValue: {
    fontSize: 15,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailItem: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  lastDetailItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  refreshButton: {
    position: 'absolute',
    top: 24,
    right: 24,
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
