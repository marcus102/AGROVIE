import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Briefcase,
  CircleCheck as CheckCircle2,
  ExternalLink,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Mission } from '@/types/mission';
import { experienceLevelLabels } from '@/constants/specializations';

interface MissionCardProps {
  mission: Mission;
  index: number;
  colors: any;
  user: any;
  applyingToMission: string | null;
  onApply: (mission: Mission) => void;
  formatPrice: (price: string | number) => string;
  formatDate: (dateString: string) => string;
}

export const MissionCard = memo(
  ({
    mission,
    index,
    colors,
    user,
    applyingToMission,
    onApply,
    formatPrice,
    formatDate,
  }: MissionCardProps) => {
    const hasApplied = mission.applicants?.includes(user?.id || '');

    return (
      <View style={[styles.missionCard, { backgroundColor: colors.card }]}>
        {mission.mission_images && mission.mission_images.length > 0 && (
          <Image
            source={{ uri: mission.mission_images[0] }}
            style={styles.missionImage}
            onError={() => console.log('Mission image failed to load')}
          />
        )}

        <View style={styles.missionContent}>
          <View style={styles.missionHeader}>
            <Text
              style={[styles.missionTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {mission.mission_title}
            </Text>
            <Text style={[styles.missionPrice, { color: colors.primary }]}>
              {formatPrice(mission.final_price)}
            </Text>
          </View>

          <Text
            style={[styles.missionDescription, { color: colors.muted }]}
            numberOfLines={3}
          >
            {mission.mission_description}
          </Text>

          <View style={styles.missionDetails}>
            <View style={styles.missionDetailRow}>
              <MapPin size={16} color={colors.muted} />
              <Text
                style={[styles.missionDetailText, { color: colors.muted }]}
                numberOfLines={1}
              >
                {mission.location}
              </Text>
            </View>

            <View style={styles.missionDetailRow}>
              <Users size={16} color={colors.muted} />
              <Text style={[styles.missionDetailText, { color: colors.muted }]}>
                {mission.needed_actor_amount} {mission.needed_actor}(s)
              </Text>
            </View>

            <View style={styles.missionDetailRow}>
              <Calendar size={16} color={colors.muted} />
              <Text style={[styles.missionDetailText, { color: colors.muted }]}>
                {formatDate(mission.start_date)} -{' '}
                {formatDate(mission.end_date)}
              </Text>
            </View>

            <View style={styles.missionDetailRow}>
              <Star size={16} color={colors.muted} />
              <Text style={[styles.missionDetailText, { color: colors.muted }]}>
                {experienceLevelLabels[mission.required_experience_level]}
              </Text>
            </View>
          </View>

          <View style={styles.missionActions}>
            <TouchableOpacity
              style={[styles.readMoreButton, { borderColor: colors.border }]}
              onPress={() => router.push(`/mission/${mission.id}`)}
            >
              <ExternalLink size={16} color={colors.text} />
              <Text style={[styles.readMoreButtonText, { color: colors.text }]}>
                Lire plus
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.applyButton,
                {
                  backgroundColor: hasApplied ? colors.success : colors.primary,
                  opacity: applyingToMission === mission.id ? 0.7 : 1,
                },
              ]}
              onPress={() => onApply(mission)}
              disabled={applyingToMission === mission.id || hasApplied}
            >
              {applyingToMission === mission.id ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : hasApplied ? (
                <CheckCircle2 size={16} color={colors.card} />
              ) : (
                <Briefcase size={16} color={colors.card} />
              )}
              <Text style={[styles.applyButtonText, { color: colors.card }]}>
                {hasApplied
                  ? 'Candidature envoyée'
                  : applyingToMission === mission.id
                  ? 'Candidature...'
                  : 'Postuler'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  missionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  missionImage: {
    width: '100%',
    height: 160,
  },
  missionContent: {
    padding: 16,
  },
  missionHeader: {
    marginBottom: 12,
  },
  missionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 24,
  },
  missionPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  missionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  missionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  missionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  missionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  readMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  readMoreButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
