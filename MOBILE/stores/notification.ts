import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Notification,
  NotificationRead,
  NotificationStatus,
  NotificationType,
} from '@/types/notification';
import { supabase } from '@/lib/supabase';

interface NotificationState {
  notifications: Notification[];
  draftNotification: Partial<Notification> | null;
  loading: boolean;
  error: string | null;
  readNotificationIds: string[];
  setNotifications: (notifications: Notification[]) => void;
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

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      draftNotification: null,
      loading: false,
      error: null,
      readNotificationIds: [],

      setNotifications: (notifications) => set({ notifications }),
      setDraftNotification: (notification) =>
        set({ draftNotification: notification }),
      updateDraftNotification: (updates) =>
        set((state) => ({
          draftNotification: state.draftNotification
            ? { ...state.draftNotification, ...updates }
            : updates,
        })),

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
      }),
    }
  )
);
