import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ArrowRight, Briefcase } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Mission } from '@/types/mission';
import { MissionCard } from './MissionCard';

interface MissionsSectionProps {
  profile: any;
  colors: any;
  missionsLoading: boolean;
  filteredMissions: Mission[];
  user: any;
  applyingToMission: string | null;
  onApplyToMission: (mission: Mission) => void;
  formatPrice: (price: string | number) => string;
  formatDate: (dateString: string) => string;
  fetchMissions: () => void;
}

export const MissionsSection = memo(({
  profile,
  colors,
  missionsLoading,
  filteredMissions,
  user,
  applyingToMission,
  onApplyToMission,
  formatPrice,
  formatDate,
  fetchMissions,
}: MissionsSectionProps) => {
  // Don't show missions section for entrepreneurs
  if (profile?.role === 'entrepreneur') {
    return null;
  }

  return (
    <View style={styles.missionsSection}>
      <Animated.View entering={FadeInDown.delay(1400)}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Missions disponibles
        </Text>
      </Animated.View>

      {missionsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Chargement des missions...
          </Text>
        </View>
      ) : filteredMissions.length > 0 ? (
        <View style={styles.missionsList}>
          {filteredMissions.slice(0, 5).map((mission, index) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              index={index}
              colors={colors}
              user={user}
              applyingToMission={applyingToMission}
              onApply={onApplyToMission}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          ))}
          
          {filteredMissions.length > 5 && (
            <Animated.View entering={FadeInDown.delay(1600)}>
              <TouchableOpacity
                style={[styles.viewAllButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => router.push('./missions')}
              >
                <Text style={[styles.viewAllButtonText, { color: colors.primary }]}>
                  Voir toutes les missions ({filteredMissions.length})
                </Text>
                <ArrowRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(1500)}
          style={[styles.emptyMissionsContainer, { backgroundColor: colors.card }]}
        >
          <Briefcase size={48} color={colors.muted} />
          <Text style={[styles.emptyMissionsTitle, { color: colors.text }]}>
            Aucune mission disponible
          </Text>
          <Text style={[styles.emptyMissionsText, { color: colors.muted }]}>
            Il n'y a actuellement aucune mission active correspondant à votre profil.
            Revenez bientôt pour découvrir de nouvelles opportunités!
          </Text>
          <TouchableOpacity
            style={[styles.refreshMissionsButton, { backgroundColor: colors.primary }]}
            onPress={fetchMissions}
            disabled={missionsLoading}
          >
            {missionsLoading ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <ArrowRight size={16} color={colors.card} />
            )}
            <Text style={[styles.refreshMissionsButtonText, { color: colors.card }]}>
              {missionsLoading ? 'Actualisation...' : 'Actualiser'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  missionsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 12,
  },
  missionsList: {
    gap: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewAllButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  emptyMissionsContainer: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyMissionsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyMissionsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshMissionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  refreshMissionsButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});