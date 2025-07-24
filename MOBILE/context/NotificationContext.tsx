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
  retryTokenRegistration: () => Promise<void>;
  isTokenSaved: boolean;
  permissionStatus: string;
  isSupported: boolean;
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
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [isSupported, setIsSupported] = useState(true);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const isTokenSaved = !!expoPushToken;

  const retryTokenRegistration = async () => {
    try {
      setError(null); // Clear previous errors
      console.log('🔔 Retrying token registration...');
      
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      
      // Update permission status after successful registration
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      
      console.log('✅ Token registration retry successful');
    } catch (err) {
      console.error('❌ Token registration retry failed:', err);
      setError(err as Error);
      
      // Still update permission status even on failure
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    }
  };

  // Load stored token on mount
  useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
        if (storedToken) {
          setExpoPushToken(storedToken);
          console.log('✅ Loaded stored push token');
        }
      } catch (error) {
        console.error('❌ Failed to load stored token:', error);
      }
    };

    loadStoredToken();
  }, []);

  // Initialize permissions and token registration
  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return;
      
      try {
        console.log('🔔 Initializing notifications...');
        
        // Check current permission status first
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
        console.log(`🔔 Current permission status: ${status}`);
        
        // Only try to register if we don't have a token yet
        if (!expoPushToken) {
          console.log('🔔 No existing token, attempting registration...');
          const token = await registerForPushNotificationsAsync();
          setExpoPushToken(token);
          await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
          
          // Update permission status after registration
          const { status: newStatus } = await Notifications.getPermissionsAsync();
          setPermissionStatus(newStatus);
        }
        
        console.log('✅ Notification initialization complete');
      } catch (err) {
        console.error('❌ Notification initialization failed:', err);
        setError(err as Error);
        
        // Still update permission status on error
        try {
          const { status } = await Notifications.getPermissionsAsync();
          setPermissionStatus(status);
        } catch (permErr) {
          console.error('❌ Failed to get permission status:', permErr);
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, [expoPushToken, isInitialized]);

  // Set up notification listeners
  useEffect(() => {
    console.log('🔔 Setting up notification listeners...');
    
    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('🔔 Notification received:', notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('🔔 Notification response:', response);
        // Handle notification tap/interaction here
      });

    return () => {
      console.log('🔔 Cleaning up notification listeners...');
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
      value={{
        expoPushToken,
        notification,
        error,
        retryTokenRegistration,
        isTokenSaved,
        permissionStatus,
        isSupported,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};