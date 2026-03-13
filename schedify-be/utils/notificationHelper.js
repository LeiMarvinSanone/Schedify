import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotifications = async (tokens, title, body) => {
  // Filter valid tokens
  const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) return;

  // Create messages
  const messages = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { title, body },
  }));

  // Send in chunks
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }
};