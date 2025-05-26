import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Star, MapPin, Clock, Award } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { MatchResult } from '@/types/matching';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface JobMatchingCardProps {
  match: MatchResult;
  onSelect: (match: MatchResult) => void;
  index: number;
}

export function JobMatchingCard({ match, onSelect, index }: JobMatchingCardProps) {
  const { colors } = useThemeStore();

  const formatScore = (score: number) => `${Math.round(score * 100)}%`;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={[
        styles.container,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>
            {formatScore(match.score)}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.muted }]}>
            Compatibilité
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Star size={16} color={colors.warning} />
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {match.ratingScore.toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Award size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            Compétences: {formatScore(match.skillMatch)}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MapPin size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            Distance: {formatScore(match.distanceScore)}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Clock size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            Disponibilité: {formatScore(match.availabilityScore)}
          </Text>
        </View>
      </View>

      <View style={[styles.pricing, { backgroundColor: colors.primary + '10' }]}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.muted }]}>
            Tarif de base
          </Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>
            {match.pricing.baseRate.toLocaleString()} FCFA/jour
          </Text>
        </View>

        <View>
          <Text style={[styles.priceLabel, { color: colors.muted }]}>
            Frais de distance
          </Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>
            +{match.pricing.distanceFee.toLocaleString()} FCFA
          </Text>
        </View>

        <View>
          <Text style={[styles.priceLabel, { color: colors.muted }]}>
            Prix final
          </Text>
          <Text style={[styles.finalPrice, { color: colors.primary }]}>
            {match.pricing.finalPrice.toLocaleString()} FCFA
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.selectButton, { backgroundColor: colors.primary }]}
        onPress={() => onSelect(match)}
      >
        <Text style={[styles.selectButtonText, { color: colors.card }]}>
          Sélectionner
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  scoreLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  details: {
    marginBottom: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  pricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  priceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  finalPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  selectButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});