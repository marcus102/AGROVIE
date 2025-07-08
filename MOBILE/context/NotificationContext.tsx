import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationAsync';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const PUSH_TOKEN_STORAGE_KEY = '@agro_push_token';

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  // Load stored token on mount
  useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
        if (storedToken) {
          setExpoPushToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to load stored token:', error);
      }
    };

    loadStoredToken();
  }, []);

  // Register for push notifications and set up listeners
  useEffect(() => {
    const registerAndSetup = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
        await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      } catch (err) {
        setError(err as Error);
      }

      // Set up notification listeners
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log('Notification response:', response);
        });
    };

    registerAndSetup();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
