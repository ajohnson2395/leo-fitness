import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Request permission and get the Expo push token for this device
 * @returns Promise that resolves to a push token string, or undefined if not available
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;
  
  // Only proceed on actual physical devices, not simulators
  if (!Device.isDevice) {
    console.log('Push notifications are only available on physical devices');
    return undefined;
  }
  
  // Android requires explicit notification channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  // If permission was denied, return undefined
  if (finalStatus !== 'granted') {
    console.log('Permission for notifications was denied');
    return undefined;
  }
  
  try {
    // Get the token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.error('Missing project ID in app config');
      return undefined;
    }
    
    // Get the token for this device
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    
    token = expoPushToken.data;
    console.log('Push token obtained:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  return token;
}

/**
 * Send a local notification (useful for testing)
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to include with the notification
 */
export async function sendLocalNotification(
  title: string, 
  body: string,
  data?: Record<string, any>
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: {
      seconds: 1, // Show after 1 second
    },
  });
  
  console.log('Local notification scheduled');
}

/**
 * Configure notification handlers
 */
export function setupNotifications() {
  // Configure how notifications are handled when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,        // Show a visible alert
      shouldPlaySound: true,        // Play a sound
      shouldSetBadge: true,         // Update the app badge count
    }),
  });
}

/**
 * Add listener for receiving notifications
 * @param callback Function to call when a notification is received
 * @returns A subscription that should be removed when no longer needed
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user interacts with a notification
 * @param callback Function to call when user taps on a notification
 * @returns A subscription that should be removed when no longer needed
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove a notification subscription
 * @param subscription The subscription to remove
 */
export function removeNotificationSubscription(subscription: Notifications.Subscription): void {
  Notifications.removeNotificationSubscription(subscription);
}