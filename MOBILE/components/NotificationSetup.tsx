import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Bell, Settings, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';
import { useNotification } from '@/context/NotificationContext';
import * as Notifications from 'expo-notifications';

interface NotificationSetupProps {
  onComplete?: () => void;
}

export const NotificationSetup: React.FC<NotificationSetupProps> = ({ onComplete }) => {
  const { colors } = useThemeStore();
  const { expoPushToken, error, retryTokenRegistration, isSupported } = useNotification();
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      
      setPermissionStatus(status);
      
      if (status === 'granted') {
        retryTokenRegistration();
      } else {
        Alert.alert(
          'Autorisations requises',
          'Les notifications sont importantes pour recevoir des mises à jour. Vous pouvez les activer dans les paramètres.',
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Paramètres', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (expoPushToken && permissionStatus === 'granted') {
    return (
      <View style={[styles.container, styles.successContainer, { backgroundColor: colors.success + '20' }]}>
        <CheckCircle size={24} color={colors.success} />
        <Text style={[styles.title, { color: colors.success }]}>
          Notifications configurées
        </Text>
        <Text style={[styles.message, { color: colors.success }]}>
          Vous recevrez des notifications importantes
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
        <AlertTriangle size={24} color={colors.error} />
        <Text style={[styles.title, { color: colors.error }]}>
          Configuration requise
        </Text>
        <Text style={[styles.message, { color: colors.error }]}>
          {error.message.includes('Firebase') 
            ? 'Configuration Firebase manquante'
            : error.message.includes('permissions')
            ? 'Autorisations de notification requises'
            : 'Erreur de configuration'}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.error }]}
          onPress={retryTokenRegistration}
        >
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={[styles.container, styles.warningContainer, { backgroundColor: colors.warning + '20' }]}>
        <Bell size={24} color={colors.warning} />
        <Text style={[styles.title, { color: colors.warning }]}>
          Activer les notifications
        </Text>
        <Text style={[styles.message, { color: colors.warning }]}>
          Recevez des notifications importantes sur vos missions et messages
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.warning }]}
            onPress={requestPermissions}
          >
            <Text style={styles.buttonText}>Activer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.warning }]}
            onPress={() => Linking.openSettings()}
          >
            <Settings size={16} color={colors.warning} />
            <Text style={[styles.secondaryButtonText, { color: colors.warning }]}>
              Paramètres
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  successContainer: {
    borderWidth: 1,
    borderColor: '#10b981',
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  warningContainer: {
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});