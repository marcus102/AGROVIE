import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LucideProps } from 'lucide-react-native';

interface StatCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  value: string | number;
  colors: {
    card: string;
    text: string;
    primary: string;
    muted: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, colors }) => (
  <View style={[styles.card, { backgroundColor: colors.card }]}>
    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
      <Icon size={24} color={colors.primary} />
    </View>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 6,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});