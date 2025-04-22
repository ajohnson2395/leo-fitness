import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerPushToken } from '../api';

/**
 * React hook for managing push notifications in the application
 * 
 * @param isAuthenticated - Whether the user is currently authenticated
 * @returns Push notification state and control functions
 */
export default function usePushNotifications(isAuthenticated: boolean) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  useEffect(() => {
    // Setup notification handler for foreground notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permission and get push token
    const getPushToken = async () => {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return;
      }

      // Check/request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permissions');
        return;
      }

      try {
        // Android requires notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        // Get project ID from app config
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          console.error('Missing Expo project ID in app config');
          return;
        }

        // Get token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        
        const token = tokenData.data;
        setExpoPushToken(token);
        
        // If user is authenticated, register token with server
        if (isAuthenticated && token) {
          try {
            await registerPushToken(token);
            console.log('Push token registered with server');
          } catch (error) {
            console.error('Failed to register push token with server:', error);
          }
        }
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    // Setup notification listeners
    const setupListeners = () => {
      // When a notification is received while the app is in the foreground
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received in foreground:', notification);
        setNotification(notification);
      });

      // When a user taps on a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('User tapped notification:', response);
        // This is where you can handle navigation or other actions 
        // based on notification content
      });
    };

    // Initialize everything
    getPushToken();
    setupListeners();

    // Cleanup on component unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]); // Re-run if auth status changes

  /**
   * Sends a local notification - useful for testing
   */
  const sendLocalNotification = async (
    title: string, 
    body: string, 
    data: Record<string, any> = {}
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: 2 },
    });
  };

  return {
    pushToken: expoPushToken,
    lastNotification: notification,
    sendLocalNotification,
  };
}