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
