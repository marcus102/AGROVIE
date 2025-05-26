import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { MessageSquare, Bell, Zap, Tag } from 'lucide-react-native';
import { BaseModal } from './BaseModal';
import { useNotificationStore } from '@/stores/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '@/stores/theme';

const NotificationItem = ({
  icon: Icon,
  title,
  isEnabled,
  onToggle,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  isEnabled: boolean;
  onToggle: () => void;
}) => (
  <View style={styles.notificationItem}>
    <View style={styles.notificationInfo}>
      <Icon size={24} color="#166534" />
      <Text style={[styles.notificationTitle, { color: '#ffff' }]}>{title}</Text>
    </View>
    <Switch
      value={isEnabled}
      onValueChange={onToggle}
      trackColor={{ false: '#e5e7eb', true: '#dcfce7' }}
      thumbColor={isEnabled ? '#166534' : '#9ca3af'}
    />
  </View>
);


export default function NotificationSettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState({
    message: true,
    news: true,
    update: true,
    ads: false,
    sounds: true,
    vibrations: true,
    push: true,
  });

  const { updateNotification } = useNotificationStore();

  interface NotificationsState {
    message: boolean;
    news: boolean;
    update: boolean;
    ads: boolean;
    sounds: boolean;
    vibrations: boolean;
    push: boolean;
  }

  // Load saved preferences when component mounts
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem(
          'notificationPreferences'
        );
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
      } catch (error) {
        console.error('Failed to load notification preferences', error);
      }
    };

    loadNotifications();
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem(
          'notificationPreferences',
          JSON.stringify(notifications)
        );
      } catch (error) {
        console.error('Failed to save notification preferences', error);
      }
    };

    saveNotifications();
  }, [notifications]);

  const toggleNotification = (key: keyof NotificationsState) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    updateNotification(key, { [key]: newNotifications[key] });
  };

  const { colors } = useThemeStore();

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Types de notifications</Text>
          <NotificationItem
            icon={MessageSquare}
            title="Messages"
            isEnabled={notifications.message}
            onToggle={() => toggleNotification('message')}
          />
          <NotificationItem
            icon={Bell}
            title="Actualités"
            isEnabled={notifications.news}
            onToggle={() => toggleNotification('news')}
          />
          <NotificationItem
            icon={Zap}
            title="Mises à jour"
            isEnabled={notifications.update}
            onToggle={() => toggleNotification('update')}
          />
          <NotificationItem
            icon={Tag}
            title="Promotions"
            isEnabled={notifications.ads}
            onToggle={() => toggleNotification('ads')}
          />
        </View>
      </ScrollView>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {},
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: '#6b7280',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
});
