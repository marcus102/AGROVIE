// import { Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';

// // Configure notification behavior
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// export async function registerForPushNotificationsAsync() {
//   let token;

//   if (Platform.OS === 'web') {
//     // Web platform doesn't support push notifications yet
//     return null;
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== 'granted') {
//       console.warn('Failed to get push token for push notification!');
//       return null;
//     }

//     token = await Notifications.getExpoPushTokenAsync({
//       projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
//     });
//   } else {
//     console.warn('Must use physical device for Push Notifications');
//   }

//   // Required for Android
//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#166534',
//     });
//   }

//   return token;
// }

// export async function scheduleLocalNotification(
//   title: string,
//   body: string,
//   trigger?: Notifications.NotificationTriggerInput
// ) {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title,
//       body,
//       sound: true,
//       badge: 1,
//     },
//     trigger: trigger || null,
//   });
// }

// export async function sendPushNotification(
//   expoPushToken: string,
//   title: string,
//   body: string,
//   data?: Record<string, unknown>
// ) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title,
//     body,
//     data: data || {},
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }

// export function addNotificationListener(
//   callback: (notification: Notifications.Notification) => void
// ) {
//   const subscription = Notifications.addNotificationReceivedListener(callback);
//   return subscription;
// }

// export function addNotificationResponseListener(
//   callback: (response: Notifications.NotificationResponse) => void
// ) {
//   const subscription = Notifications.addNotificationResponseReceivedListener(callback);
//   return subscription;
// }