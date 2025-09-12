import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  Edit3,
  Users,
  Layers,
  DollarSign,
  FileText,
  Camera,
} from 'lucide-react-native';
import { FormData, FormErrors } from './types';

interface StepFiveProps {
  formData: FormData;
  errors: FormErrors;
  colors: any;
  onEditStep: (step: number) => void;
}

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  step: number;
  colors: any;
  onEdit: () => void;
  children: React.ReactNode;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  icon,
  step,
  colors,
  onEdit,
  children,
}) => (
  <View
    style={[
      styles.section,
      {
        backgroundColor: colors.card || '#FFFFFF',
        borderColor: colors.border || '#E5E5E5',
      },
    ]}
  >
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        {icon}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text || '#1A1A1A',
            },
          ]}
        >
          {title}
        </Text>
        <View
          style={[
            styles.stepBadge,
            {
              backgroundColor: colors.primary || '#007AFF',
            },
          ]}
        >
          <Text
            style={[
              styles.stepBadgeText,
              {
                color: '#FFFFFF', // Always white for contrast
              },
            ]}
          >
            {step}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.editButton,
          {
            backgroundColor: colors.background || '#F8F9FA',
            borderColor: colors.primary || '#007AFF',
          },
        ]}
        onPress={onEdit}
      >
        <Edit3 size={16} color={colors.primary || '#007AFF'} />
        <Text
          style={[
            styles.editButtonText,
            {
              color: colors.primary || '#007AFF',
            },
          ]}
        >
          Modifier
        </Text>
      </TouchableOpacity>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface InfoRowProps {
  label: string;
  value: string | number;
  colors: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, colors }) => (
  <View style={styles.infoRow}>
    <Text
      style={[
        styles.infoLabel,
        {
          color: colors.textSecondary || '#666666',
        },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.infoValue,
        {
          color: colors.text || '#1A1A1A',
        },
      ]}
    >
      {value}
    </Text>
  </View>
);

export const StepFive: React.FC<StepFiveProps> = ({
  formData,
  errors,
  colors,
  onEditStep,
}) => {
  // Helper functions for formatting data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatUserRole = (role: string) => {
    const roleMap = {
      worker: 'Travailleur',
      advisor: 'Conseiller',
      entrepreneur: 'Entrepreneur',
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const formatExperienceLevel = (level: string) => {
    const levelMap = {
      starter: 'Débutant',
      intermediate: 'Intermédiaire',
      expert: 'Expert',
    };
    return levelMap[level as keyof typeof levelMap] || level;
  };

  const formatSurfaceUnit = (unit: string) => {
    const unitMap = {
      hectares: 'Hectares',
      square_meter: 'Mètres carrés',
    };
    return unitMap[unit as keyof typeof unitMap] || unit;
  };

  const formatAdvantages = (advantages: string[]) => {
    if (!advantages || advantages.length === 0) return 'Aucun avantage proposé';
    return advantages.join(', ');
  };

  const formatPrice = (price: string) => {
    if (!price) return '0 FCFA';
    return `${parseFloat(price).toLocaleString('fr-FR')} FCFA`;
  };

  const isPriceCalculated =
    formData.original_price && parseFloat(formData.original_price) > 0;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background || '#F8F9FA',
        },
      ]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text || '#1A1A1A',
            },
          ]}
        >
          Récapitulatif de votre mission
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary || '#666666',
            },
          ]}
        >
          Vérifiez toutes les informations avant de créer votre mission
        </Text>
      </View>

      {/* Mission Basic Info - Step 1 */}
      <ReviewSection
        title="Informations générales"
        icon={<FileText size={20} color={colors.primary || '#007AFF'} />}
        step={1}
        colors={colors}
        onEdit={() => onEditStep(1)}
      >
        <InfoRow
          label="Titre de la mission"
          value={formData.mission_title || 'Non spécifié'}
          colors={colors}
        />
        <InfoRow
          label="Description"
          value={formData.mission_description || 'Aucune description'}
          colors={colors}
        />
        <InfoRow
          label="Localisation"
          value={formData.location || 'Non spécifiée'}
          colors={colors}
        />
        <InfoRow
          label="Date de début"
          value={formatDate(formData.start_date)}
          colors={colors}
        />
        <InfoRow
          label="Date de fin"
          value={formatDate(formData.end_date)}
          colors={colors}
        />
      </ReviewSection>

      {/* Actor Requirements - Step 2 */}
      <ReviewSection
        title="Profil recherché"
        icon={<Users size={20} color={colors.primary || '#007AFF'} />}
        step={2}
        colors={colors}
        onEdit={() => onEditStep(2)}
      >
        <InfoRow
          label="Type d'acteur"
          value={formatUserRole(formData.needed_actor)}
          colors={colors}
        />
        <InfoRow
          label="Spécialisation"
          value={formData.actor_specialization || 'Non spécifiée'}
          colors={colors}
        />
        {formData.other_actor_specialization && (
          <InfoRow
            label="Autre spécialisation"
            value={formData.other_actor_specialization}
            colors={colors}
          />
        )}
        <InfoRow
          label="Nombre d'acteurs"
          value={formData.needed_actor_amount.toString()}
          colors={colors}
        />
        <InfoRow
          label="Niveau d'expérience"
          value={formatExperienceLevel(formData.required_experience_level)}
          colors={colors}
        />
      </ReviewSection>

      {/* Mission Details - Step 3 */}
      <ReviewSection
        title="Détails de la mission"
        icon={<Layers size={20} color={colors.primary || '#007AFF'} />}
        step={3}
        colors={colors}
        onEdit={() => onEditStep(3)}
      >
        <InfoRow
          label="Surface"
          value={`${formData.surface_area} ${formatSurfaceUnit(
            formData.surface_unit
          )}`}
          colors={colors}
        />
        <InfoRow
          label="Équipement fourni"
          value={formData.equipment ? 'Oui' : 'Non'}
          colors={colors}
        />
        <InfoRow
          label="Avantages proposés"
          value={formatAdvantages(formData.proposed_advantages)}
          colors={colors}
        />
      </ReviewSection>

      {/* Images - Step 4 */}
      <ReviewSection
        title="Images de la mission"
        icon={<Camera size={20} color={colors.primary || '#007AFF'} />}
        step={4}
        colors={colors}
        onEdit={() => onEditStep(4)}
      >
        {formData.mission_images && formData.mission_images.length > 0 ? (
          <View style={styles.imagesContainer}>
            {formData.mission_images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: image }}
                  style={[
                    styles.image,
                    {
                      borderColor: colors.border || '#E5E5E5',
                    },
                  ]}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={[
              styles.noImagesText,
              {
                color: colors.textSecondary || '#666666',
              },
            ]}
          >
            Aucune image ajoutée
          </Text>
        )}

        {formData.personalized_expression && (
          <View
            style={[
              styles.expressionContainer,
              {
                backgroundColor: colors.background || '#F8F9FA',
                borderColor: colors.border || '#E5E5E5',
              },
            ]}
          >
            <Text
              style={[
                styles.expressionLabel,
                {
                  color: colors.textSecondary || '#666666',
                },
              ]}
            >
              Expression personnalisée :
            </Text>
            <Text
              style={[
                styles.expressionText,
                {
                  color: colors.text || '#1A1A1A',
                },
              ]}
            >
              {formData.personalized_expression}
            </Text>
          </View>
        )}
      </ReviewSection>

      {/* Pricing Summary */}
      <ReviewSection
        title="Tarification"
        icon={<DollarSign size={20} color={colors.primary || '#007AFF'} />}
        step={3}
        colors={colors}
        onEdit={() => onEditStep(3)}
      >
        {!isPriceCalculated ? (
          <View
            style={[
              styles.priceWarning,
              {
                backgroundColor: (colors.error || '#FF3B30') + '20',
                borderColor: colors.error || '#FF3B30',
              },
            ]}
          >
            <Text
              style={[
                styles.priceWarningText,
                {
                  color: colors.error || '#FF3B30',
                },
              ]}
            >
              Le prix n'a pas encore été calculé. Retournez à l'étape 3 pour
              calculer le prix.
            </Text>
          </View>
        ) : (
          <View style={styles.pricingContainer}>
            <InfoRow
              label="Prix de base"
              value={formatPrice(formData.original_price)}
              colors={colors}
            />
            <InfoRow
              label="Ajustement"
              value={formatPrice(formData.adjustment_price)}
              colors={colors}
            />
            <View
              style={[
                styles.finalPriceContainer,
                {
                  backgroundColor: colors.background || '#F8F9FA',
                  borderColor: colors.border || '#E5E5E5',
                },
              ]}
            >
              <Text
                style={[
                  styles.finalPriceLabel,
                  {
                    color: colors.textSecondary || '#666666',
                  },
                ]}
              >
                Prix final
              </Text>
              <Text
                style={[
                  styles.finalPrice,
                  {
                    color: colors.primary || '#007AFF',
                  },
                ]}
              >
                {formatPrice(formData.final_price)}
              </Text>
            </View>
          </View>
        )}
      </ReviewSection>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <View
          style={[
            styles.errorContainer,
            {
              backgroundColor: (colors.error || '#FF3B30') + '20',
              borderColor: colors.error || '#FF3B30',
            },
          ]}
        >
          <Text
            style={[
              styles.errorTitle,
              {
                color: colors.error || '#FF3B30',
              },
            ]}
          >
            Veuillez corriger les erreurs suivantes :
          </Text>
          {Object.entries(errors).map(([field, error]) => (
            <Text
              key={field}
              style={[
                styles.errorText,
                {
                  color: colors.error || '#FF3B30',
                },
              ]}
            >
              • {error}
            </Text>
          ))}
        </View>
      )}

      {/* Bottom spacing for navigation */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    textAlign: 'left',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 32,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    includeFontPadding: false,
    textAlign: 'center',
  },
  sectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    minHeight: 32,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
    textAlign: 'left',
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
    includeFontPadding: false,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
  },
  noImagesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
    includeFontPadding: false,
  },
  expressionContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  expressionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    includeFontPadding: false,
    textAlign: 'left',
  },
  expressionText: {
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
    textAlign: 'left',
  },
  pricingContainer: {
    gap: 8,
  },
  finalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  finalPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
    textAlign: 'left',
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: '700',
    includeFontPadding: false,
    textAlign: 'right',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    includeFontPadding: false,
    textAlign: 'left',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 4,
    includeFontPadding: false,
    textAlign: 'left',
  },
  priceWarning: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  priceWarningText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    includeFontPadding: false,
  },
  bottomSpacing: {
    height: 80,
  },
});
