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

  // Android: Set up notification channel
  if (Platform.OS === 'android') {
    console.log('🔔 Setting up Android notification channel...');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check & request permissions
  console.log('🔔 Checking notification permissions...');
  let { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log(`🔔 Existing permission status: ${existingStatus}`);

  let finalStatus = existingStatus;

  // Only request permissions if not already granted
  if (existingStatus !== 'granted') {
    console.log('🔔 Requesting notification permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log(`🔔 New permission status: ${status}`);
  }

  // Only throw if the final status is not granted (after user decision)
  if (finalStatus !== 'granted') {
    throw new Error('Notification permissions not granted');
  }

  // Get project ID (fallback to expoConfig or easConfig)
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  console.log(`🔔 Project ID: ${projectId || 'Not found'}`);

  if (!projectId) {
    throw new Error('EAS Project ID not found. Configure it in app.json');
  }

  // Get Expo push token
  console.log('🔔 Getting Expo push token...');
  try {
    const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    console.log('✅ Push token received successfully:', pushToken);
    return pushToken; // Return token for storage
  } catch (error) {
    console.error('❌ Failed to get push token:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(`Failed to get push token: ${errorMessage}`);
  }
}
