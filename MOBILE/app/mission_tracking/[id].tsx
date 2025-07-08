import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Target,
  Calendar,
} from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useMissionTrackingStore } from '@/stores/mission_tracking';
import { useAuthStore } from '@/stores/auth';
import { useMissionStore } from '@/stores/mission';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function MissionTrackingScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStore();
  const {
    tracking,
    loading,
    fetchMissionTracking,
    startTracking,
    pauseTracking,
    resumeTracking,
    completeTracking,
    updateTracking,
  } = useMissionTrackingStore();
  const { user } = useAuthStore();
  const { fetchMissionByID } = useMissionStore();

  const [mission, setMission] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initializeTracking = async () => {
      if (!id || !user?.id) return;

      try {
        // Fetch mission details
        const missionData = await fetchMissionByID(id as string);
        setMission(missionData);

        // Fetch or create tracking
        await fetchMissionTracking(id as string, user.id);
      } catch (error) {
        console.error('Error initializing tracking:', error);
      }
    };

    initializeTracking();
  }, [id, user?.id]);

  const handleStartTracking = async () => {
    if (!id || !user?.id) return;

    try {
      await startTracking(id as string, user.id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer le suivi');
    }
  };

  const handlePauseTracking = async () => {
    if (!tracking?.id) return;

    try {
      await pauseTracking(tracking.id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre en pause');
    }
  };

  const handleResumeTracking = async () => {
    if (!tracking?.id) return;

    try {
      await resumeTracking(tracking.id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de reprendre');
    }
  };

  const handleCompleteTracking = async () => {
    if (!tracking?.id) return;

    Alert.alert(
      'Terminer la mission',
      'Êtes-vous sûr de vouloir marquer cette mission comme terminée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            try {
              await completeTracking(tracking.id);
              Alert.alert('Succès', 'Mission terminée avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de terminer la mission');
            }
          },
        },
      ]
    );
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const calculateTimeLeft = () => {
    if (!mission?.end_date) return 0;

    const endDate = new Date(mission.end_date);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const calculateCurrentEarnings = () => {
    if (!tracking || !mission?.final_price) return 0;

    const totalPrice = parseFloat(mission.final_price);
    const completionRate = tracking.completion_rate / 100;

    return Math.floor(totalPrice * completionRate);
  };

  if (loading && !tracking) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Gradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.gradientHeader}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <Animated.View
            entering={FadeInUp.delay(200)}
            style={styles.headerContent}
          >
            <View style={styles.headerIcon}>
              <Target size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Suivi de Mission</Text>
            <Text style={styles.headerSubtitle}>
              {mission?.mission_title || 'Chargement...'}
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Cards */}
        <View style={styles.statsGrid}>
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={[styles.statCard, { backgroundColor: colors.card }]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <TrendingUp size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {tracking?.completion_rate || 0}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Progression
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400)}
            style={[styles.statCard, { backgroundColor: colors.card }]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: '#10b981' + '20' }]}
            >
              <Clock size={24} color="#10b981" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatTime(tracking?.time_worked || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Temps travaillé
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500)}
            style={[styles.statCard, { backgroundColor: colors.card }]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: '#f59e0b' + '20' }]}
            >
              <DollarSign size={24} color="#f59e0b" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(calculateCurrentEarnings())}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Gains actuels
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600)}
            style={[styles.statCard, { backgroundColor: colors.card }]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: '#8b5cf6' + '20' }]}
            >
              <Calendar size={24} color="#8b5cf6" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {calculateTimeLeft()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Jours restants
            </Text>
          </Animated.View>
        </View>

        {/* Progress Section */}
        <Animated.View
          entering={FadeInDown.delay(700)}
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Progression des tâches
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {tracking?.tasks_completed || 0} / {tracking?.total_tasks || 10}{' '}
                tâches
              </Text>
              <Text
                style={[styles.progressPercentage, { color: colors.primary }]}
              >
                {tracking?.completion_rate || 0}%
              </Text>
            </View>

            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${tracking?.completion_rate || 0}%`,
                  },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.updateButton,
              { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => {
              // Simple increment for demo
              if (tracking && tracking.tasks_completed < tracking.total_tasks) {
                const newCompleted = tracking.tasks_completed + 1;
                const newRate = Math.round(
                  (newCompleted / tracking.total_tasks) * 100
                );
                updateTracking(tracking.id, {
                  tasks_completed: newCompleted,
                  completion_rate: newRate,
                  earnings: calculateCurrentEarnings(),
                });
              }
            }}
            disabled={tracking?.tasks_completed === tracking?.total_tasks}
          >
            <CheckCircle2 size={20} color={colors.primary} />
            <Text style={[styles.updateButtonText, { color: colors.primary }]}>
              Marquer une tâche comme terminée
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Control Buttons */}
        <Animated.View
          entering={FadeInDown.delay(800)}
          style={styles.controlsContainer}
        >
          {!tracking ? (
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleStartTracking}
            >
              <Play size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Commencer la mission</Text>
            </TouchableOpacity>
          ) : tracking.status === 'active' ? (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: '#f59e0b' }]}
              onPress={handlePauseTracking}
            >
              <Pause size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Mettre en pause</Text>
            </TouchableOpacity>
          ) : tracking.status === 'paused' ? (
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleResumeTracking}
            >
              <Play size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Reprendre</Text>
            </TouchableOpacity>
          ) : null}

          {tracking && tracking.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: '#10b981' }]}
              onPress={handleCompleteTracking}
            >
              <Square size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Terminer la mission</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Mission Info */}
        <Animated.View
          entering={FadeInDown.delay(900)}
          style={[styles.section, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informations de la mission
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>
                Rémunération totale
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatCurrency(parseFloat(mission?.final_price || '0'))}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>
                Date de fin
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {mission?.end_date
                  ? new Date(mission.end_date).toLocaleDateString('fr-FR')
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>
                Statut
              </Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {tracking?.status === 'active'
                  ? 'En cours'
                  : tracking?.status === 'paused'
                  ? 'En pause'
                  : tracking?.status === 'completed'
                  ? 'Terminé'
                  : 'Non démarré'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
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
    fontSize: 24,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
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
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  updateButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  controlsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  controlButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  infoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
