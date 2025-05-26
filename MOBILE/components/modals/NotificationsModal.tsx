import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BaseModal } from './BaseModal';
import { Star, Award, MessageSquare, Bell, Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNotificationStore } from '@/stores/notification';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '@/stores/theme';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

// Map notification types to preference keys
const notificationTypeMap: Record<string, keyof NotificationPreferences> = {
  message: 'message',
  application: 'news',
  mission: 'update',
  achievement: 'ads',
};

interface NotificationPreferences {
  message: boolean;
  news: boolean;
  update: boolean;
  ads: boolean;
  sounds: boolean;
  vibrations: boolean;
  push: boolean;
}

export function NotificationsModal({
  visible,
  onClose,
}: NotificationsModalProps) {
  const {
    notifications,
    fetchNotifications,
    loading,
    error,
    markAllAsRead,
    markAsRead,
    getUnreadCount,
  } = useNotificationStore();
  
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    message: true,
    news: true,
    update: true,
    ads: false,
    sounds: true,
    vibrations: true,
    push: true,
  });

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await AsyncStorage.getItem('notificationPreferences');
        if (savedPrefs) {
          setNotificationPreferences(JSON.parse(savedPrefs));
        }
      } catch (error) {
        console.error('Failed to load notification preferences', error);
      }
    };
    
    loadPreferences();
  }, []);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return Star;
      case 'mission':
        return Bell;
      case 'message':
        return MessageSquare;
      case 'achievement':
        return Award;
      default:
        return Bell;
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    }).replace('il y a ', 'Il y a ');
  };

  // Filter notifications based on user preferences
  const filteredNotifications = notifications.filter(notification => {
    const preferenceKey = notificationTypeMap[notification.type];
    return preferenceKey ? notificationPreferences[preferenceKey] : true;
  });

  const { colors } = useThemeStore();

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            disabled={getUnreadCount() === 0}
          >
            <Check size={20} color="#166534" />
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#166534" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {filteredNotifications.map((notification, index) => {
              const Icon = getIcon(notification.type);
              return (
                <Animated.View
                  key={notification.id}
                  entering={FadeInDown.delay(index * 100)}
                >
                  <TouchableOpacity
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadItem,
                    ]}
                    onPress={() => handleMarkAsRead(notification.id)}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: !notification.read
                            ? '#f0fdf4'
                            : '#f3f4f6',
                        },
                      ]}
                    >
                      <Icon
                        size={24}
                        color={!notification.read ? '#166534' : '#6b7280'}
                      />
                    </View>

                    <View style={styles.notificationContent}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          !notification.read && styles.unreadText,
                        ]}
                      >
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.context}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.created_at)}
                      </Text>
                    </View>

                    {!notification.read && (
                      <View style={styles.unreadDot} />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
            {filteredNotifications.length === 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Aucune notification</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '90%',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 8,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  markAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  unreadItem: {
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  unreadText: {
    color: '#111827',
  },
  notificationMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#166534',
    marginLeft: 12,
  },
});