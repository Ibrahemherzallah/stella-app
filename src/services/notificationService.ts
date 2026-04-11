import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const INSTALLATION_ID_KEY = 'stella_installation_id';

function generateInstallationId() {
  return `install_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getInstallationId() {
  let installationId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);

  if (!installationId) {
    installationId = generateInstallationId();
    await AsyncStorage.setItem(INSTALLATION_ID_KEY, installationId);
  }

  return installationId;
}

export async function registerGuestForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push permission not granted');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log('Missing Expo/EAS projectId');
      return null;
    }

    console.log('registerGuestForPushNotificationsAsync started');

    const expoPushToken = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    console.log('Expo push token is:', expoPushToken);

    const installationId = await getInstallationId();
    console.log('installationId is:', installationId);

    await setDoc(
      doc(db, 'push_subscribers', installationId),
      {
        installationId,
        expoPushToken,
        platform: Platform.OS,
        isActive: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log('push_subscribers doc saved successfully');
    console.log('Saved guest push subscriber:', installationId, expoPushToken);

    return expoPushToken;
  } catch (error) {
    console.error('registerGuestForPushNotificationsAsync error:', error);
    return null;
  }
}