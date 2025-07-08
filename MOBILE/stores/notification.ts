import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Notification,
  NotificationType,
  PushToken,
} from '@/types/notification';
import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface NotificationState {
  notifications: Notification[];
  draftNotification: Partial<Notification> | null;
  loading: boolean;
  error: string | null;
  readNotificationIds: string[];
  pushToken: string | null;
  tokenSaveStatus: 'idle' | 'saving' | 'saved' | 'error';

  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  setDraftNotification: (notification: Partial<Notification> | null) => void;
  updateDraftNotification: (updates: Partial<Notification>) => void;
  fetchNotifications: () => Promise<void>;
  fetchNotificationByID: (id: string) => Promise<Notification | null>;
  createNotification: (
    notification: Partial<Notification>
  ) => Promise<Notification | null>;
  updateNotification: (
    id: string,
    updates: Partial<Notification>
  ) => Promise<Notification | null>;
  deleteNotification: (id: string) => Promise<void>;
  publishNotification: (notification: Notification) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => number;
  savePushToken: (token: string) => Promise<void>;
  getPushToken: () => Promise<string | null>;
  deletePushToken: () => Promise<void>;
  // updateNotification: (key: string, value: any) => void;
}

// Type guard for NotificationType
function isNotificationType(type: string): type is NotificationType {
  return ['info', 'success', 'warning', 'error'].includes(type);
}

// Transformation function
function transformNotification(data: any, readIds: string[]): Notification {
  if (!isNotificationType(data.type)) {
    console.warn(
      `Invalid notification type: ${data.type}, defaulting to 'info'`
    );
    data.type = 'info';
  }

  return {
    ...data,
    type: data.type as NotificationType,
    read: readIds.includes(data.id),
    status: data.status || 'draft',
  };
}

// Get device information for push token metadata
const getDeviceInfo = () => {
  return {
    deviceName: Device.deviceName,
    deviceType: Device.deviceType,
    osName: Device.osName,
    osVersion: Device.osVersion,
    platform: Platform.OS,
    modelName: Device.modelName,
    brand: Device.brand,
    timestamp: new Date().toISOString(),
  };
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      draftNotification: null,
      loading: false,
      error: null,
      readNotificationIds: [],
      pushToken: null,
      tokenSaveStatus: 'idle',

      setNotifications: (notifications) => set({ notifications }),
      setUnreadCount: (count: number) =>
        set((state) => ({ ...state, unreadCount: count })),
      setDraftNotification: (notification) =>
        set({ draftNotification: notification }),
      updateDraftNotification: (updates) =>
        set((state) => ({
          draftNotification: state.draftNotification
            ? { ...state.draftNotification, ...updates }
            : updates,
        })),

      savePushToken: async (token: string) => {
        set({ loading: true, error: null, tokenSaveStatus: 'saving' });
        try {
          console.log('🔔 Saving push token to database...');

          // Get current user ID
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            throw new Error('User not authenticated');
          }

          console.log('🔔 User authenticated, proceeding with token save...');

          // Prepare device info
          const deviceInfo = getDeviceInfo();

          // Upsert token to database
          const { data, error } = await supabase
            .from('user_push_tokens')
            .upsert(
              {
                user_id: user.id,
                expo_push_token: token,
                device_info: deviceInfo,
                is_active: true,
              },
              {
                onConflict: 'user_id',
                ignoreDuplicates: false,
              }
            )
            .select()
            .single();

          if (error) {
            console.error('🔔 Database error:', error);
            throw error;
          }

          console.log('🔔 Token saved successfully:', data);

          // Update local state
          set({
            pushToken: token,
            tokenSaveStatus: 'saved',
            error: null,
          });

          return data;
        } catch (error) {
          console.error('🔔 Error saving push token:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to save push token',
            tokenSaveStatus: 'error',
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      getPushToken: async () => {
        set({ loading: true, error: null });
        try {
          // Get current user ID
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            throw new Error('User not authenticated');
          }

          // Fetch token from database
          const { data, error } = await supabase
            .from('user_push_tokens')
            .select('expo_push_token')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is acceptable
            throw error;
          }

          const token = data?.expo_push_token || null;
          set({ pushToken: token });
          return token;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to get push token',
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      deletePushToken: async () => {
        set({ loading: true, error: null });
        try {
          // Get current user ID
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            throw new Error('User not authenticated');
          }

          // Delete token from database
          const { error } = await supabase
            .from('user_push_tokens')
            .delete()
            .eq('user_id', user.id);

          if (error) throw error;

          // Update local state
          set({
            pushToken: null,
            tokenSaveStatus: 'idle',
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete push token',
          });
        } finally {
          set({ loading: false });
        }
      },

      // updateNotification: (key: string, value: any) => {
      //   set((state) => ({
      //     ...state,
      //     [key]: value,
      //   }));
      // },

      fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
          const { data: notificationsData, error: notificationsError } =
            await supabase
              .from('notifications')
              .select('*')
              .order('created_at', { ascending: false });

          if (notificationsError) throw notificationsError;

          const { data: readData } = await supabase
            .from('notifications_read')
            .select('notification_id');

          const readIds = (readData || []).map((r) => r.notification_id);

          set({
            notifications: notificationsData.map((n) =>
              transformNotification(n, readIds)
            ),
            readNotificationIds: readIds,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch notifications',
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchNotificationByID: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          return transformNotification(data, get().readNotificationIds);
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch notification',
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      createNotification: async (notification) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('notifications')
            .insert({
              ...notification,
              read: false,
              status: 'draft',
            })
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            notifications: [
              transformNotification(data, state.readNotificationIds),
              ...state.notifications,
            ],
          }));
          return data;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create notification',
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      updateNotification: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('notifications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id
                ? transformNotification(data, get().readNotificationIds)
                : n
            ),
          }));
          return data;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update notification',
          });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      deleteNotification: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete notification',
          });
        } finally {
          set({ loading: false });
        }
      },

      publishNotification: async (notification) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ status: 'published' })
            .eq('id', notification.id);

          if (error) throw error;

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notification.id ? { ...n, status: 'online' } : n
            ),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to publish notification',
          });
        } finally {
          set({ loading: false });
        }
      },

      markAsRead: async (id) => {
        set({ loading: true });
        try {
          const { error } = await supabase
            .from('notifications_read')
            .upsert({ notification_id: id });

          if (error) throw error;

          set((state) => ({
            readNotificationIds: [...state.readNotificationIds, id],
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to mark as read',
          });
        } finally {
          set({ loading: false });
        }
      },

      markAllAsRead: async () => {
        set({ loading: true });
        try {
          const ids = get().notifications.map((n) => n.id);
          const insertData = ids.map((id) => ({ notification_id: id }));

          const { error } = await supabase
            .from('notification_reads')
            .upsert(insertData);

          if (error) throw error;

          set({
            readNotificationIds: ids,
            notifications: get().notifications.map((n) => ({
              ...n,
              read: true,
            })),
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to mark all as read',
          });
        } finally {
          set({ loading: false });
        }
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
        readNotificationIds: state.readNotificationIds,
        pushToken: state.pushToken,
      }),
    }
  )
);
