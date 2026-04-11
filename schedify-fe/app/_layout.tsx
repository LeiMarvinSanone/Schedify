
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from '../ThemeContext';
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { updatePushToken } from '../utils/apiClient';
import { registerBackgroundSync } from '../utils/backgroundSync';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export default function RootLayout() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      const userRaw = await AsyncStorage.getItem('schedify:auth:user:v1');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (user && token) {
        try {
          await updatePushToken(token);
        } catch (e) {
          console.error('Failed to update push token:', e);
        }
      }
        await registerBackgroundSync(); 
    };
    setupNotifications();

    // Listen for notifications while app is running (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can handle foreground notification here
    });

    // Listen for notification taps (background/quit)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // You can navigate based on notification data here
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}