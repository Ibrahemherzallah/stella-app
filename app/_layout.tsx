import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationIndependentTree } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { CurrencyProvider } from '@/src/context/CurrencyContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { RootNavigator } from '@/src/navigation/RootNavigator';
import { registerGuestForPushNotificationsAsync } from '@/src/services/notificationService';
import { SafeAreaProvider } from 'react-native-safe-area-context';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function AppBootstrap() {
    useEffect(() => {
        registerGuestForPushNotificationsAsync();
    }, []);

    useEffect(() => {
        const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
            console.log('Notification received:', notification);
        });

        const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification tapped:', response);
        });

        return () => {
            receivedSub.remove();
            responseSub.remove();
        };
    }, []);

    return (
      <>
          <NavigationIndependentTree>
              <RootNavigator />
          </NavigationIndependentTree>
          <StatusBar style="auto" />
      </>
    );
}

export default function RootLayout() {
    useFrameworkReady();

    return (
      <SafeAreaProvider>
          <ThemeProvider>
              <CurrencyProvider>
                  <AuthProvider>
                      <AppBootstrap />
                  </AuthProvider>
              </CurrencyProvider>
          </ThemeProvider>
      </SafeAreaProvider>
    );
}