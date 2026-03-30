import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotifications = async (tokens, title, body) => {

  const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.log("No valid Expo push tokens found");
    return;
  }

  const messages = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { title, body },
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push tickets:", tickets);
    } catch (error) {
      console.error("Push notification error:", error);
    }
  }
};