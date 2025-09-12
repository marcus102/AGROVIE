import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { User, Star, Clock, TrendingUp } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { MissionEmployee } from '@/types/mission_tracking';

interface EmployeeCardProps {
  employee: MissionEmployee;
  onPress: () => void;
}

export function EmployeeCard({ employee, onPress }: EmployeeCardProps) {
  const { colors } = useThemeStore();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'completed':
        return colors.primary;
      case 'left':
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Terminé';
      case 'left':
        return 'Parti';
      default:
        return 'Inconnu';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {employee.profile.profile_picture ? (
            <Image
              source={{ uri: employee.profile.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <User size={24} color={colors.primary} />
            </View>
          )}
          
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {employee.profile.full_name}
            </Text>
            <Text style={[styles.role, { color: colors.muted }]}>
              {employee.profile.role === 'worker' ? 'Ouvrier' : 'Technicien'}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(employee.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(employee.status) }]}>
            {getStatusText(employee.status)}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <TrendingUp size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {employee.tracking.completion_rate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            Progression
          </Text>
        </View>

        <View style={styles.statItem}>
          <Clock size={16} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatTime(employee.tracking.time_worked)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            Temps
          </Text>
        </View>

        <View style={styles.statItem}>
          <Star size={16} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            4.5
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            Note
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  role: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});