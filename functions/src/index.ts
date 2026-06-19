import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

initializeApp();

export const notifyUsersOnGoldSettingsUpdate = onDocumentUpdated(
  {
    document: 'settings/today',
    region: 'us-central1',
  },
  async (event) => {
    try {
      const beforeData = event.data?.before.data();
      const afterData = event.data?.after.data();

      if (!beforeData || !afterData) {
        console.log('Missing before/after data');
        return;
      }

      if (JSON.stringify(beforeData) === JSON.stringify(afterData)) {
        console.log('No real settings changes detected');
        return;
      }

      const db = getFirestore();
      const subscribersSnapshot = await db.collection('push_subscribers').get();

      const tokens: string[] = [];

      subscribersSnapshot.forEach((doc) => {
        const data = doc.data();

        if (
          data.isActive === true &&
          typeof data.expoPushToken === 'string' &&
          data.expoPushToken.startsWith('ExponentPushToken[')
        ) {
          tokens.push(data.expoPushToken);
        }
      });

      const uniqueTokens = [...new Set(tokens)];

      if (uniqueTokens.length === 0) {
        console.log('No Expo push tokens found');
        return;
      }

      const messages = uniqueTokens.map((token) => ({
        to: token,
        sound: 'default',
        title: 'تحديث أسعار الذهب',
        body: 'تم تحديث الأسعار من قبل الإدارة',
        data: {
          type: 'stellagold-settings-updated',
          screen: 'PricesScreen',
        },
      }));
      console.log(`Sending to ${messages.length} tokens`);

      // Expo's push API rejects any request with more than 100 messages, so
      // send in chunks of 100 instead of one batch for the whole audience.
      const EXPO_PUSH_CHUNK_SIZE = 100;

      for (let i = 0; i < messages.length; i += EXPO_PUSH_CHUNK_SIZE) {
        const chunk = messages.slice(i, i + EXPO_PUSH_CHUNK_SIZE);

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        });

        const result = await response.json();
        console.log(
          `Expo push response (chunk ${i / EXPO_PUSH_CHUNK_SIZE + 1}, ${chunk.length} messages):`,
          JSON.stringify(result, null, 2)
        );
      }
    } catch (error) {
      console.error('notifyUsersOnGoldSettingsUpdate error:', error);
    }
  }
);
