import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  console.log('🔔 Starting push notification registration...');

  // Check if running on physical device
  if (!Device.isDevice) {
    console.log('❌ Not a physical device, skipping push notifications');
    throw new Error('Push notifications require a physical device');
  }

  // Android: Set up notification channel BEFORE requesting permissions
  if (Platform.OS === 'android') {
    console.log('🔔 Setting up Android notification channel...');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: null,
      enableVibrate: true,
      showBadge: true,
    });
  }

  // Check current permissions
  console.log('🔔 Checking notification permissions...');
  let { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log(`🔔 Existing permission status: ${existingStatus}`);

  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    console.log('🔔 Requesting notification permissions...');

    // For Android, use a more explicit approach
    if (Platform.OS === 'android') {
      const requestResult = await Notifications.requestPermissionsAsync({
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: true,
        },
      });
      finalStatus = requestResult.status;
      console.log(`🔔 Android permission request result:`, requestResult);
    } else {
      // iOS permissions
      const requestResult = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = requestResult.status;
      console.log(`🔔 iOS permission request result:`, requestResult);
    }

    console.log(`🔔 Final permission status: ${finalStatus}`);
  }

  // Handle permission denial
  if (finalStatus !== 'granted') {
    const errorMessage = `Notification permissions denied. Status: ${finalStatus}`;
    console.log(`❌ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // Get project ID with better error handling
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  console.log(`🔔 Project ID: ${projectId || 'Not found'}`);

  if (!projectId) {
    const errorMessage =
      'EAS Project ID not found. Please configure it in app.json under "extra.eas.projectId"';
    console.log(`❌ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // Get Expo push token
  console.log('🔔 Getting Expo push token...');
  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
      // Removed unsupported 'experienceId' property
    });

    const pushToken = tokenResult.data;
    console.log('✅ Push token received successfully:', pushToken);
    return pushToken;
  } catch (error) {
    console.error('❌ Failed to get push token:', error);
    let errorMessage = 'Unknown error occurred while getting push token';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(`Failed to get push token: ${errorMessage}`);
  }
}
