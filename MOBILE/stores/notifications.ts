import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendPushNotification } from '@/lib/notifications';

interface NotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  loading: boolean;
  error: string | null;
  
  initializeNotifications: () => Promise<void>;
  sendNotification: (title: string, body: string, data?: Record<string, unknown>) => Promise<void>;
  clearNotification: () => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  expoPushToken: null,
  notification: null,
  loading: false,
  error: null,

  initializeNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        set({ expoPushToken: token.data });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to initialize notifications' });
    } finally {
      set({ loading: false });
    }
  },

  sendNotification: async (title: string, body: string, data?: Record<string, unknown>) => {
    set({ loading: true, error: null });
    try {
      const token = get().expoPushToken;
      if (!token) {
        throw new Error('Push token not available');
      }
      await sendPushNotification(token, title, body, data);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to send notification' });
    } finally {
      set({ loading: false });
    }
  },

  clearNotification: () => set({ notification: null }),
  setError: (error) => set({ error }),
}));