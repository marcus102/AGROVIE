import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  colors: {
    text: string;
    primary: string;
    card: string;
  };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionText, onActionPress, colors }) => (
  <View style={styles.header}>
    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    {actionText && (
      <TouchableOpacity onPress={onActionPress} style={[styles.actionButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.actionText, { color: colors.card }]}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});