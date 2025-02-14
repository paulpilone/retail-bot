import notifier from 'node-notifier';

import config from './config.js';
import { NotificationAttributes, NotificationType } from './types.js';
import { snsClient } from './aws/sns-client.js';
import { PublishCommand } from '@aws-sdk/client-sns';

export async function sendNotification(notificationType: string, attrs: NotificationAttributes) {
  if (notificationType === NotificationType.local) {
    sendLocalNotification(attrs);
  } else if (notificationType === NotificationType.sns) {
    await sendSnsNotification(attrs);
  } else {
    console.log(`Unrecognized notification type ${notificationType}`);
  }
}

/**
 * 
 * @param attrs 
 */
export async function sendSnsNotification(attrs: NotificationAttributes) {
  const response = await snsClient.send(new PublishCommand({
    TopicArn: config.notificationSnsTopicArn,
    Message: `${attrs.title} - ${attrs.message} - ${attrs.url}`,
    MessageAttributes: {
      retailer: {
        DataType: 'String',
        StringValue: attrs.retailer,
      }
    }
  }));

  console.log(`SNS response: ${JSON.stringify(response)}`);
};

/**
 *
 * @param attrs
 */
export function sendLocalNotification(attrs: NotificationAttributes) {
  notifier.notify({
    title: `${attrs.title}`,
    message: attrs.message,
    open: attrs.url,
    sound: true,
    timeout: 30
  });
};
