import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  PenTool as Tool,
  Tag,
  AlertCircle,
  CreditCard,
  RotateCcw,
  X,
  Trash,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/theme';
import { useMissionStore } from '@/stores/mission';
import { Mission, MissionStatus } from '@/types/mission';
import { Toast, ToastType } from '@/components/Toast';

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

function MissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStore();
  const {
    fetchMissionByIDWithImages,
    updateMission,
    deleteMission,
    loading,
    error,
  } = useMissionStore();
  const [mission, setMission] = useState<Mission | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchMission = async () => {
      if (id) {
        const fetchedMission = await fetchMissionByIDWithImages(id as string);
        if (!loading && !error && fetchedMission) {
          setMission(fetchedMission);
        }
      }
    };
    fetchMission();
  }, [id]);

  const showToast = (type: ToastType, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const handleCancelMission = async () => {
    try {
      if (mission) {
        await updateMission(mission.id, { status: 'removed' });
        const fetchedMission = await fetchMissionByIDWithImages(id as string);
        setMission(fetchedMission);
        showToast('success', 'Mission annulée avec succès');
      }
    } catch (error) {
      console.error('Error cancelling mission:', error);
      showToast('error', "Erreur lors de l'annulation de la mission");
    }
  };

  const handleReverseCancellation = async () => {
    try {
      if (mission) {
        await updateMission(mission.id, { status: 'in_review' });
        const fetchedMission = await fetchMissionByIDWithImages(id as string);
        setMission(fetchedMission);
        showToast('success', 'Mission rétablie avec succès');
      }
    } catch (error) {
      console.error('Error reversing cancellation:', error);
      showToast('error', 'Erreur lors du rétablissement de la mission');
    }
  };

  const handleDeleteMission = async () => {
    try {
      await deleteMission(mission?.id as string);
      setIsModalVisible(false);
      showToast('success', 'Mission supprimée avec succès');

      // Navigate after a short delay to allow the toast to be seen
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error deleting mission:', error);
      setIsModalVisible(false);
      showToast('error', 'Erreur lors de la suppression de la mission');
    }
  };

  if (!loading && !mission) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <AlertCircle size={48} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Mission introuvable
        </Text>
        <Text style={[styles.errorText, { color: colors.muted }]}>
          La mission que vous recherchez n'existe pas ou a été supprimée.
        </Text>
        <TouchableOpacity
          style={[styles.backToHomeButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backToHomeText, { color: colors.card }]}>
            Retour aux missions
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const InfoCard = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ComponentType<{ size: number; color: string }>;
    label: string;
    value: string;
  }) => (
    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
      <Icon size={20} color={colors.primary} />
      <View style={styles.infoCardContent}>
        <Text style={[styles.infoCardLabel, { color: colors.muted }]}>
          {label}
        </Text>
        <Text style={[styles.infoCardValue, { color: colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <Animated.View
      entering={FadeInDown}
      style={[styles.section, { backgroundColor: colors.card }]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </Animated.View>
  );

  const StatusBadge = ({
    status,
  }: {
    status: 'online' | 'in_review' | 'rejected' | string;
  }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'online':
          return colors.success;
        case 'in_review':
          return colors.warning;
        case 'rejected':
          return colors.error;
        default:
          return colors.muted;
      }
    };

    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor() + '20' },
        ]}
      >
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Text>
      </View>
    );
  };

  const getSpecializationLabel = () => {
    const specialization = mission?.actor_specialization;
    const role = mission?.needed_actor;

    if (role === 'technician') {
      const category = technicianCategories.find(
        (cat) => cat.value === specialization
      );
      if (specialization === 'other') {
        return mission?.other_actor_specialization || 'Autre (spécifié)';
      }
      return category?.label || specialization;
    } else if (role === 'worker') {
      const category = workerCategories.find(
        (cat) => cat.value === specialization
      );
      if (specialization === 'other') {
        return mission?.other_actor_specialization || 'Autre (spécifié)';
      }
      return category?.label || specialization;
    }
    return specialization; // For entrepreneur or other roles
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onHide={hideToast}
        duration={3000}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverImageContainer}>
          <Image
            source={{ uri: mission?.mission_images[0] }}
            style={styles.coverImage}
          />
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            {mission && <StatusBadge status={mission.status} />}
            <Text style={[styles.title, { color: colors.text }]}>
              {mission?.mission_title}
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              {parseInt(mission?.final_price || '0').toLocaleString()} FCFA
            </Text>
          </View>

          {/* Cancel/Reverse buttons */}
          {mission &&
            (mission.status === ('in_review' as MissionStatus) ||
              mission.status === ('accepted' as MissionStatus) ||
              mission.status === ('removed' as MissionStatus)) && (
              <Animated.View
                entering={FadeInDown}
                style={styles.cancelButtonContainer}
              >
                {mission.status !== ('removed' as MissionStatus) ? (
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      { backgroundColor: colors.error + '20' },
                    ]}
                    onPress={handleCancelMission}
                    disabled={loading}
                  >
                    <X size={20} color={colors.error} />
                    <Text
                      style={[styles.cancelButtonText, { color: colors.error }]}
                    >
                      {loading
                        ? 'Annulation en cours...'
                        : 'Annuler la mission'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.reverseButton,
                      { backgroundColor: colors.success + '20' },
                    ]}
                    onPress={handleReverseCancellation}
                    disabled={loading}
                  >
                    <RotateCcw size={20} color={colors.success} />
                    <Text
                      style={[
                        styles.reverseButtonText,
                        { color: colors.success },
                      ]}
                    >
                      {loading
                        ? 'Restauration en cours...'
                        : 'Rétablir la mission'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: colors.error },
                  ]}
                  onPress={() => setIsModalVisible(true)}
                  disabled={loading}
                >
                  <Trash size={20} color={'#fff'} />
                  <Text style={[styles.reverseButtonText, { color: '#fff' }]}>
                    Supprimer la mission
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

          {/* Quick Info Grid */}
          <View style={styles.infoGrid}>
            <InfoCard
              icon={MapPin}
              label="Localisation"
              value={mission?.location ?? ''}
            />
            <InfoCard
              icon={Calendar}
              label="Période"
              value={`${mission?.start_date ?? ''} - ${
                mission?.end_date ?? ''
              }`}
            />
            <InfoCard
              icon={Users}
              label="Postes"
              value={`${mission?.needed_actor_amount ?? ''} ${
                mission?.needed_actor ?? ''
              }(s)`}
            />
            <InfoCard
              icon={Clock}
              label="Expérience"
              value={mission?.required_experience_level ?? ''}
            />
          </View>

          {/* Description */}
          <Section title="Description">
            <Text style={[styles.description, { color: colors.text }]}>
              {mission?.mission_description ?? ''}
            </Text>
          </Section>

          {/* Actor Specialization */}
          <Section title="Spécialisation de l'acteur">
            <Text style={[styles.description, { color: colors.text }]}>
              {getSpecializationLabel()}
            </Text>

            {/* Display custom specialization if it exists */}
            {mission?.other_actor_specialization && (
              <View style={styles.customSpecializationContainer}>
                <Text
                  style={[styles.customSpecialization, { color: colors.text }]}
                >
                  {mission.other_actor_specialization}
                </Text>
              </View>
            )}
          </Section>

          {/* Surface Details */}
          <Section title="Surface">
            <View style={styles.surfaceDetails}>
              <Text style={[styles.surfaceLabel, { color: colors.muted }]}>
                Surface
              </Text>
              <Text style={[styles.surfaceValue, { color: colors.text }]}>
                {mission && mission.surface_area
                  ? `${mission.surface_area} ${mission.surface_unit || ''}`
                  : 'Non spécifié'}
              </Text>
            </View>
          </Section>

          {/* Equipment */}
          <Section title="Équipement">
            <View style={styles.equipmentContainer}>
              <Tool size={24} color={colors.primary} />
              <Text style={[styles.equipmentText, { color: colors.text }]}>
                {mission && mission.equipment
                  ? 'Équipement fourni'
                  : 'Équipement non fourni'}
              </Text>
            </View>
          </Section>

          {/* Advantages */}
          {mission && mission.proposed_advantages.length > 0 && (
            <Section title="Avantages">
              <View style={styles.advantagesGrid}>
                {mission.proposed_advantages.map((advantage, index) => (
                  <View
                    key={index}
                    style={[
                      styles.advantageTag,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Tag size={16} color={colors.primary} />
                    <Text
                      style={[styles.advantageText, { color: colors.primary }]}
                    >
                      {advantage.charAt(0).toUpperCase() +
                        advantage.slice(1).replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Price Details */}
          <Section title="Détails du prix">
            <View style={styles.priceDetails}>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>
                  Prix initial
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  {parseInt(
                    mission?.original_price?.price || '0'
                  ).toLocaleString()}{' '}
                  FCFA
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>
                  Ajustements
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  {mission &&
                  mission.adjustment_price &&
                  mission.adjustment_price.price
                    ? parseInt(
                        mission.adjustment_price.price
                      ).toLocaleString() + ' FCFA'
                    : '0 FCFA'}
                </Text>
              </View>
              <View style={[styles.priceRow, styles.finalPriceRow]}>
                <Text style={[styles.finalPriceLabel, { color: colors.text }]}>
                  Prix final
                </Text>
                <Text
                  style={[styles.finalPriceValue, { color: colors.primary }]}
                >
                  {mission && mission.final_price
                    ? parseInt(mission.final_price).toLocaleString() + ' FCFA'
                    : ''}
                </Text>
              </View>

              {mission && mission.status === ('accepted' as MissionStatus) && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.payButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => router.push(`/payment/${mission.id}`)}
                  >
                    <CreditCard size={20} color={colors.card} />
                    <Text
                      style={[styles.payButtonText, { color: colors.card }]}
                    >
                      Payer maintenant
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Section>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Confirmer la suppression
            </Text>
            <Text style={[styles.modalText, { color: colors.muted }]}>
              Voulez-vous vraiment supprimer cette mission ? Cette action est
              irréversible.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setIsModalVisible(false)}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteMission}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: colors.card }]}>
                  {loading ? 'Suppression...' : 'Supprimer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImageContainer: {
    position: 'relative',
    height: 300,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoCardContent: {
    marginLeft: 12,
  },
  infoCardLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  infoCardValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  equipmentText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  advantageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  advantageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  priceDetails: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  priceValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  finalPriceRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  finalPriceLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  finalPriceValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  payButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  customSpecializationContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  customSpecialization: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontStyle: 'italic',
  },
  cancelButtonContainer: {
    marginBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  reverseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  reverseButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backToHomeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToHomeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  surfaceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  surfaceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  surfaceValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});

export default MissionDetailScreen;
