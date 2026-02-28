let Expo;
let expoClient;

async function getExpoClient() {
  if (!expoClient) {
    const sdk = await import('expo-server-sdk');
    Expo = sdk.Expo;
    expoClient = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN
    });
  }
  return { Expo, expoClient };
}

/**
 * Sends a single push notification using the Expo SDK.
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  return await sendMultiplePushNotifications([pushToken], title, body, data);
}

/**
 * Sends notifications to multiple tokens in bulk.
 */
async function sendMultiplePushNotifications(pushTokens, title, body, data = {}) {
  const { Expo, expoClient } = await getExpoClient();
  
  const messages = [];
  for (const pushToken of pushTokens) {
    if (Expo.isExpoPushToken(pushToken)) {
      const message = {
        to: pushToken,
        data: data,
      };
      
      // Only include visible fields if they are provided
      if (title) message.title = title;
      if (body) message.body = body;
      
      // Only include sound if we have visibility (standard behavior for Expo)
      // If it's a silent notification (no title/body), we usually omit sound
      if (title || body) {
        message.sound = 'default';
      }
      
      messages.push(message);
    } else {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
    }
  }

  if (messages.length === 0) return;

  try {
    const chunks = expoClient.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      const ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);
      console.log('Push notifications sent. Tickets:', ticketChunk.length);
    }
  } catch (error) {
    console.error('Error sending bulk push notifications via Expo SDK:', error);
  }
}

module.exports = { sendPushNotification, sendMultiplePushNotifications };
