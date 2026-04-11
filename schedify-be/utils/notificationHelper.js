import { Expo } from 'expo-server-sdk';
import User from '../models/User.js';

const expo = new Expo();

export const sendPushNotifications = async (tokens, title, body) => {

  const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.log('No valid Expo push tokens found');
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
  const badTokens = [];

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);

      tickets.forEach((ticket, i) => {
        if (ticket.status === 'error') {
          console.error(`Push error for token ${chunk[i].to}:`, ticket.message);
          if (ticket.details?.error === 'DeviceNotRegistered') {
            badTokens.push(chunk[i].to);
          }
        }
      });

    } catch (error) {
      console.error('Push notification chunk error:', error);
    }
  }

  if (badTokens.length > 0) {
    await User.updateMany(
      { expoPushToken: { $in: badTokens } },
      { $unset: { expoPushToken: '' } }
    );
    console.log(`Removed ${badTokens.length} stale push token(s)`);
  }
};