const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN
});

/**
 * Sends a single push notification using the Expo SDK.
 * @param {string} pushToken - The recipient's Expo push token.
 * @param {string} title - Title of the notification.
 * @param {string} body - Body content of the notification.
 * @param {object} data - Optional metadata for the app to process.
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  return await sendMultiplePushNotifications([pushToken], title, body, data);
}

/**
 * Sends notifications to multiple tokens in bulk.
 * @param {string[]} pushTokens - Array of recipient's Expo push tokens.
 */
async function sendMultiplePushNotifications(pushTokens, title, body, data = {}) {
  const messages = [];
  for (const pushToken of pushTokens) {
    if (Expo.isExpoPushToken(pushToken)) {
      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      });
    } else {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
    }
  }

  if (messages.length === 0) return;

  try {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Push notifications sent. Tickets:', ticketChunk.length);
    }
  } catch (error) {
    console.error('Error sending bulk push notifications via Expo SDK:', error);
  }
}

module.exports = { sendPushNotification, sendMultiplePushNotifications };
