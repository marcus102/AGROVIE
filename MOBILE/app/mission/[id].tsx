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
  ActivityIndicator,
  FlatList,
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
  TrendingUp,
  Eye,
  Phone,
  Star,
  Award,
  DollarSign,
  Calendar as CalendarIcon,
  FileText,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/theme';
import { useMissionStore } from '@/stores/mission';
import { useMissionTrackingStore } from '@/stores/mission_tracking';
import { useAuthStore } from '@/stores/auth';
import { getPaymentRecord } from '@/stores/payment';
import { Mission, MissionStatus } from '@/types/mission';
import { Toast, ToastType } from '@/components/Toast';
import { EmployeeCard } from '@/components/EmplyeeCard';
import {
  advisorSpecializations,
  workerSpecializations,
} from '@/constants/specializations';

// Enhanced participant interface
interface Participant {
  id: string;
  user_id: string;
  name: string;
  profile_image?: string;
  phone?: string;
  experience_level: string;
  specialization: string;
  rating: number;
  completed_missions: number;
  application_date: string;
  status: 'pending' | 'accepted' | 'rejected';
}

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
  const { employees, fetchMissionEmployees } = useMissionTrackingStore();
  const { user } = useAuthStore();
  const [mission, setMission] = useState<Mission | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isParticipantsModalVisible, setIsParticipantsModalVisible] =
    useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');

  // Replace the existing useEffect participants parsing section with this fixed version:

  useEffect(() => {
    const fetchMission = async () => {
      if (id) {
        const fetchedMission = await fetchMissionByIDWithImages(id as string);
        if (!loading && !error && fetchedMission) {
          setMission(fetchedMission);

          // If user is the mission owner, fetch employees and payment info
          if (fetchedMission.user_id === user?.id) {
            await fetchMissionEmployees(id as string);

            // Fetch payment information if mission has payment_id
            if (fetchedMission.payment_id) {
              try {
                const payment = await getPaymentRecord(
                  fetchedMission.payment_id
                );
                setPaymentInfo(payment);
              } catch (error) {
                console.error('Error fetching payment info:', error);
              }
            }
          }

          // Parse applicants if they exist - UPDATED PARSING LOGIC
          if (fetchedMission.applicants) {
            try {
              let applicantsData = [];

              // Handle the specific data format: array of JSON strings
              if (typeof fetchedMission.applicants === 'string') {
                try {
                  // First parse the outer array
                  const outerArray = JSON.parse(fetchedMission.applicants);

                  if (Array.isArray(outerArray)) {
                    // Parse each JSON string in the array
                    applicantsData = outerArray
                      .map((item: string) => {
                        try {
                          return JSON.parse(item);
                        } catch (parseError) {
                          console.warn(
                            'Failed to parse individual applicant:',
                            item,
                            parseError
                          );
                          return null;
                        }
                      })
                      .filter((item) => item !== null);
                  } else {
                    // If it's not an array after first parse, might be a single object
                    applicantsData = [outerArray];
                  }
                } catch (jsonError) {
                  console.warn(
                    'Failed to parse applicants as JSON:',
                    jsonError
                  );
                  applicantsData = [];
                }
              } else if (Array.isArray(fetchedMission.applicants)) {
                // If it's already an array, check if elements are strings that need parsing
                applicantsData = fetchedMission.applicants
                  .map((item) => {
                    try {
                      return typeof item === 'string' ? JSON.parse(item) : item;
                    } catch (e) {
                      console.warn('Failed to parse applicant item:', item, e);
                      return null;
                    }
                  })
                  .filter((item) => item !== null);
              }

              // Transform to participants format with proper mapping
              if (Array.isArray(applicantsData) && applicantsData.length > 0) {
                const participantsData = applicantsData.map(
                  (applicant: any, index: number) => ({
                    id: applicant.id || `participant-${index}`,
                    user_id: applicant.id || '', // Using id as user_id since that's what's provided
                    name:
                      applicant.full_name ||
                      applicant.name ||
                      `Participant ${index + 1}`,
                    profile_image: applicant.profile_image || applicant.avatar,
                    phone: applicant.phone || applicant.phone_number,
                    experience_level:
                      applicant.experience_level ||
                      applicant.experience ||
                      'Débutant',
                    specialization:
                      applicant.specialization ||
                      applicant.actor_specialization ||
                      fetchedMission.actor_specialization ||
                      'Non spécifié',
                    rating: parseFloat(
                      applicant.rating || applicant.user_rating || '4.5'
                    ),
                    completed_missions: parseInt(
                      applicant.completed_missions ||
                        applicant.missions_count ||
                        '0'
                    ),
                    application_date:
                      applicant.applied_at ||
                      applicant.application_date ||
                      applicant.created_at ||
                      new Date().toISOString(),
                    status:
                      applicant.status ||
                      applicant.application_status ||
                      'pending',
                    // Store the role information from the data
                    role: applicant.role || 'worker',
                  })
                );

                console.log(
                  'Successfully parsed participants:',
                  participantsData
                );
                setParticipants(participantsData);
              } else {
                console.log('No valid applicants data found after parsing');
                setParticipants([]);
              }
            } catch (error) {
              console.error('Error parsing applicants:', error);
              console.log('Raw applicants data:', fetchedMission.applicants);
              setParticipants([]);
            }
          } else {
            console.log('No applicants field found in mission data');
            setParticipants([]);
          }
        }
      }
    };
    fetchMission();
  }, [id, user?.id]);

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

      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error deleting mission:', error);
      setIsModalVisible(false);
      showToast('error', 'Erreur lors de la suppression de la mission');
    }
  };

  const calculateMissionProgress = () => {
    if (employees.length === 0) return 0;
    const totalProgress = employees.reduce(
      (sum, emp) => sum + emp.tracking.completion_rate,
      0
    );
    return Math.round(totalProgress / employees.length);
  };

  const calculateTimeLeft = () => {
    if (!mission?.end_date) return 0;
    const endDate = new Date(mission.end_date);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'in_review':
        return colors.warning;
      case 'accepted':
        return colors.primary;
      case 'rejected':
        return colors.error;
      case 'completed':
        return colors.success;
      case 'removed':
        return colors.muted;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      online: 'En ligne',
      in_review: 'En révision',
      accepted: 'Acceptée',
      rejected: 'Rejetée',
      completed: 'Terminée',
      removed: 'Annulée',
    };
    return statusLabels[status] || status;
  };

  if (loading && !mission) {
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

  const StatusBadge = ({ status }: { status: string }) => (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: getStatusColor(status) + '20' },
      ]}
    >
      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );

  const ParticipantItem = ({ participant }: { participant: Participant }) => (
    <View
      style={[styles.participantItem, { backgroundColor: colors.background }]}
    >
      <View style={styles.participantHeader}>
        <View style={styles.participantInfo}>
          <View
            style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}
          >
            {participant.profile_image ? (
              <Image
                source={{ uri: participant.profile_image }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {participant.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.participantDetails}>
            <Text style={[styles.participantName, { color: colors.text }]}>
              {participant.name}
            </Text>
            <View style={styles.participantMeta}>
              <Star size={14} color={colors.warning} />
              <Text style={[styles.participantRating, { color: colors.muted }]}>
                {participant.rating}/5
              </Text>
              <Text
                style={[styles.participantDivider, { color: colors.muted }]}
              >
                •
              </Text>
              <Award size={14} color={colors.muted} />
              <Text
                style={[styles.participantMissions, { color: colors.muted }]}
              >
                {participant.completed_missions} missions
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.participantStatusBadge,
            { backgroundColor: getStatusColor(participant.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.participantStatusText,
              { color: getStatusColor(participant.status) },
            ]}
          >
            {getStatusLabel(participant.status)}
          </Text>
        </View>
      </View>

      <View style={styles.participantBody}>
        <View style={styles.participantInfoRow}>
          <Text style={[styles.participantInfoLabel, { color: colors.muted }]}>
            Spécialisation:
          </Text>
          <Text style={[styles.participantInfoValue, { color: colors.text }]}>
            {participant.specialization}
          </Text>
        </View>
        <View style={styles.participantInfoRow}>
          <Text style={[styles.participantInfoLabel, { color: colors.muted }]}>
            Expérience:
          </Text>
          <Text style={[styles.participantInfoValue, { color: colors.text }]}>
            {participant.experience_level}
          </Text>
        </View>
        <View style={styles.participantInfoRow}>
          <Text style={[styles.participantInfoLabel, { color: colors.muted }]}>
            Candidature:
          </Text>
          <Text style={[styles.participantInfoValue, { color: colors.text }]}>
            {formatDate(participant.application_date)}
          </Text>
        </View>
        {participant.phone && (
          <TouchableOpacity style={styles.participantContactButton}>
            <Phone size={16} color={colors.primary} />
            <Text
              style={[styles.participantContactText, { color: colors.primary }]}
            >
              {participant.phone}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getSpecializationLabel = () => {
    const specialization = mission?.actor_specialization;
    const role = mission?.needed_actor;

    if (role === 'advisor') {
      const category = advisorSpecializations.find(
        (cat) => cat.value === specialization
      );
      if (specialization === 'other') {
        return mission?.other_actor_specialization || 'Autre (spécifié)';
      }
      return category?.label || specialization;
    } else if (role === 'worker') {
      const category = workerSpecializations.find(
        (cat) => cat.value === specialization
      );
      if (specialization === 'other') {
        return mission?.other_actor_specialization || 'Autre (spécifié)';
      }
      return category?.label || specialization;
    }
    return specialization;
  };

  const isOwner = mission?.user_id === user?.id;
  const missionDuration =
    mission?.start_date && mission?.end_date
      ? Math.ceil(
          (new Date(mission.end_date).getTime() -
            new Date(mission.start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

        <View style={styles.content}>
          {/* Enhanced Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              {mission && <StatusBadge status={mission.status} />}
              <Text style={[styles.missionId, { color: colors.muted }]}>
                ID: {mission?.id.slice(-8)}
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {mission?.mission_title}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {parseInt(mission?.final_price || '0').toLocaleString()} FCFA
              </Text>
              {mission?.created_at && (
                <Text style={[styles.createdDate, { color: colors.muted }]}>
                  Créée le {formatDate(mission.created_at)}
                </Text>
              )}
            </View>
          </View>

          {/* Enhanced Quick Stats for Owner */}
          {isOwner && (
            <Section title="Aperçu de la mission">
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Users size={24} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {participants.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    Candidats
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Calendar size={24} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {missionDuration}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    Jours
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={24} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {calculateTimeLeft()}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    Restants
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <DollarSign size={24} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {paymentInfo ? 'Payé' : 'En attente'}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>
                    Paiement
                  </Text>
                </View>
              </View>
            </Section>
          )}

          {/* Participants Button for Owner */}
          {isOwner && participants.length > 0 && (
            <Animated.View
              entering={FadeInDown}
              style={styles.participantsButtonContainer}
            >
              <TouchableOpacity
                style={[
                  styles.participantsButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setIsParticipantsModalVisible(true)}
              >
                <Eye size={20} color={colors.card} />
                <Text
                  style={[
                    styles.participantsButtonText,
                    { color: colors.card },
                  ]}
                >
                  Voir Participants ({participants.length})
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Mission Progress for Owner */}
          {isOwner && employees.length > 0 && (
            <Section title="Progression de la mission">
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    Progression globale
                  </Text>
                  <Text
                    style={[
                      styles.progressPercentage,
                      { color: colors.primary },
                    ]}
                  >
                    {calculateMissionProgress()}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${calculateMissionProgress()}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </Section>
          )}

          {/* Employees List for Owner */}
          {isOwner && employees.length > 0 && (
            <Section title={`Employés actifs (${employees.length})`}>
              {employees.map((employee, index) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onPress={() =>
                    router.push(`/profile/view/${employee.user_id}`)
                  }
                />
              ))}
            </Section>
          )}

          {/* Mission Tracking Button for Employees */}
          {!isOwner && (
            <Animated.View
              entering={FadeInDown}
              style={styles.trackingButtonContainer}
            >
              <TouchableOpacity
                style={[
                  styles.trackingButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() =>
                  router.push(`/mission_tracking/${mission?.id ?? ''}`)
                }
              >
                <TrendingUp size={20} color={colors.card} />
                <Text
                  style={[styles.trackingButtonText, { color: colors.card }]}
                >
                  Suivre ma progression
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Enhanced Info Grid */}
          <View style={styles.infoGrid}>
            <InfoCard
              icon={() => <MapPin size={20} color={colors.primary} />}
              label="Localisation"
              value={mission?.location ?? ''}
            />
            <InfoCard
              icon={() => <CalendarIcon size={20} color={colors.primary} />}
              label="Durée"
              value={`${missionDuration} jours`}
            />
            <InfoCard
              icon={() => <Users size={20} color={colors.primary} />}
              label="Postes requis"
              value={`${mission?.needed_actor_amount ?? ''} ${
                mission?.needed_actor ?? ''
              }(s)`}
            />
            <InfoCard
              icon={() => <Award size={20} color={colors.primary} />}
              label="Expérience"
              value={mission?.required_experience_level ?? ''}
            />
          </View>

          {/* Enhanced Description */}
          <Section title="Description de la mission">
            <Text style={[styles.description, { color: colors.text }]}>
              {mission?.mission_description ?? ''}
            </Text>
            <View style={styles.missionMeta}>
              <View style={styles.metaItem}>
                <FileText size={16} color={colors.muted} />
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  Mise à jour:{' '}
                  {mission?.updated_at ? formatDate(mission.updated_at) : 'N/A'}
                </Text>
              </View>
            </View>
          </Section>

          {/* Actor Specialization */}
          <Section title="Spécialisation requise">
            <Text style={[styles.description, { color: colors.text }]}>
              {getSpecializationLabel()}
            </Text>
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

          {/* Enhanced Surface Details */}
          <Section title="Détails de la surface">
            <View style={styles.surfaceDetails}>
              <Text style={[styles.surfaceLabel, { color: colors.muted }]}>
                Surface à traiter
              </Text>
              <Text style={[styles.surfaceValue, { color: colors.text }]}>
                {mission && mission.surface_area
                  ? `${mission.surface_area} ${mission.surface_unit || 'm²'}`
                  : 'Non spécifié'}
              </Text>
            </View>
          </Section>

          {/* Equipment */}
          <Section title="Équipement et matériel">
            <View style={styles.equipmentContainer}>
              <Tool size={24} color={colors.primary} />
              <View style={styles.equipmentText}>
                <Text style={[styles.equipmentTitle, { color: colors.text }]}>
                  {mission && mission.equipment
                    ? 'Équipement fourni par le client'
                    : 'Équipement à la charge du prestataire'}
                </Text>
                <Text
                  style={[styles.equipmentDescription, { color: colors.muted }]}
                >
                  {mission && mission.equipment
                    ? 'Tous les outils et matériels nécessaires seront mis à disposition'
                    : 'Le prestataire doit apporter ses propres outils et matériels'}
                </Text>
              </View>
            </View>
          </Section>

          {/* Advantages */}
          {mission && mission.proposed_advantages.length > 0 && (
            <Section title="Avantages proposés">
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

          {/* Enhanced Price Details */}
          <Section title="Détails financiers">
            <View style={styles.priceDetails}>
              {mission?.original_price && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.muted }]}>
                    Prix initial proposé
                  </Text>
                  <Text style={[styles.priceValue, { color: colors.text }]}>
                    {mission?.original_price.price
                      ? `${parseInt(
                          mission?.original_price.price || '0'
                        ).toLocaleString()} FCFA`
                      : '0 FCFA'}
                  </Text>
                </View>
              )}

              {mission?.adjustment_price &&
                typeof mission.adjustment_price === 'string' && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: colors.muted }]}>
                      Ajustements négociés
                    </Text>
                    <Text style={[styles.priceValue, { color: colors.text }]}>
                      {parseInt(
                        JSON.parse(mission.adjustment_price).price || '0'
                      ).toLocaleString()}{' '}
                      FCFA
                    </Text>
                  </View>
                )}

              <View style={[styles.priceRow, styles.finalPriceRow]}>
                <Text style={[styles.finalPriceLabel, { color: colors.text }]}>
                  Prix final convenu
                </Text>
                <Text
                  style={[styles.finalPriceValue, { color: colors.primary }]}
                >
                  {mission && mission.final_price
                    ? `${parseInt(mission.final_price).toLocaleString()} FCFA`
                    : 'À définir'}
                </Text>
              </View>

              {/* Payment Information */}
              {paymentInfo && (
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentRow}>
                    <Text
                      style={[styles.paymentLabel, { color: colors.muted }]}
                    >
                      Statut du paiement:
                    </Text>
                    <Text
                      style={[
                        styles.paymentStatus,
                        { color: getStatusColor(paymentInfo.status) },
                      ]}
                    >
                      {getStatusLabel(paymentInfo.status)}
                    </Text>
                  </View>
                  {paymentInfo.payment_method && (
                    <View style={styles.paymentRow}>
                      <Text
                        style={[styles.paymentLabel, { color: colors.muted }]}
                      >
                        Méthode de paiement:
                      </Text>
                      <Text
                        style={[styles.paymentValue, { color: colors.text }]}
                      >
                        {paymentInfo.payment_method}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {mission &&
                mission.status === ('accepted' as MissionStatus) &&
                !paymentInfo && (
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
                        Procéder au paiement
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
          </Section>

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
        </View>
      </ScrollView>

      {/* Participants Modal */}
      <Modal
        visible={isParticipantsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsParticipantsModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                Participants à la mission
              </Text>
              <Text
                style={[styles.modalHeaderSubtitle, { color: colors.muted }]}
              >
                {participants.length} candidature
                {participants.length > 1 ? 's' : ''} reçue
                {participants.length > 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                { backgroundColor: colors.card },
              ]}
              onPress={() => setIsParticipantsModalVisible(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ParticipantItem participant={item} />}
            contentContainerStyle={styles.participantsList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={styles.participantSeparator} />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyParticipants}>
                <Users size={48} color={colors.muted} />
                <Text
                  style={[
                    styles.emptyParticipantsTitle,
                    { color: colors.text },
                  ]}
                >
                  Aucun participant
                </Text>
                <Text
                  style={[
                    styles.emptyParticipantsText,
                    { color: colors.muted },
                  ]}
                >
                  Aucune candidature n'a été reçue pour cette mission.
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.confirmModalContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.confirmModalIcon}>
              <AlertCircle size={48} color={colors.error} />
            </View>
            <Text style={[styles.confirmModalTitle, { color: colors.text }]}>
              Confirmer la suppression
            </Text>
            <Text style={[styles.confirmModalText, { color: colors.muted }]}>
              Voulez-vous vraiment supprimer cette mission ? Cette action est
              irréversible et toutes les données associées seront perdues.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => setIsModalVisible(false)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.confirmModalButtonText,
                    { color: colors.text },
                  ]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  { backgroundColor: colors.error },
                ]}
                onPress={handleDeleteMission}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.confirmModalButtonText,
                    { color: colors.card },
                  ]}
                >
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionId: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    letterSpacing: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
    lineHeight: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  createdDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  participantsButtonContainer: {
    marginBottom: 24,
  },
  participantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  participantsButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  progressPercentage: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  trackingButtonContainer: {
    marginBottom: 24,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  trackingButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
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
  missionMeta: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  equipmentText: {
    flex: 1,
  },
  equipmentTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  equipmentDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
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
    gap: 16,
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
    paddingTop: 16,
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
  paymentInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  paymentStatus: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  paymentValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
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
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  customSpecialization: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontStyle: 'italic',
  },
  surfaceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surfaceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  surfaceValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
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
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
  // Participants Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalHeaderTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  modalHeaderSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  participantsList: {
    padding: 20,
  },
  participantItem: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 4,
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
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  participantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantRating: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  participantDivider: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  participantMissions: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  participantStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 12,
  },
  participantStatusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  participantBody: {
    gap: 8,
  },
  participantInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  participantInfoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  participantContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  participantContactText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  participantSeparator: {
    height: 8,
  },
  emptyParticipants: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyParticipantsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyParticipantsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  confirmModalContainer: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
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
  confirmModalIcon: {
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmModalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmModalButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});

export default MissionDetailScreen;
