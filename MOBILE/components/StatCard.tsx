import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface StatCardProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  colors: {
    card: string;
    primary: string;
    muted: string;
    text: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, colors }) => (
  <Animated.View
    entering={FadeInDown}
    style={[styles.statCard, { backgroundColor: colors.card }]}
  >
    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
      <Icon size={24} color={colors.primary} />
    </View>
    <View style={styles.statContent}>
      <Text style={[styles.statTitle, { color: colors.muted }]}>{title}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.muted }]}>{subtitle}</Text>
      )}
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minWidth: '28%',
    padding: 10,
    alignItems: 'center',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  statSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});