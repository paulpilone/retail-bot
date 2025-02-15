import notifier from 'node-notifier';

import config from './config.js';
import { NotificationAttributes, NotificationType } from './types.js';
import snsClient from './aws/sns-client.js';
import { PublishBatchCommandOutput } from '@aws-sdk/client-sns';

/**
 * 
 * @param notificationType 
 * @param attrs 
 */
export async function sendNotification(notificationType: string[], attrs: NotificationAttributes) {
  if (notificationType.includes(NotificationType.local)) {
    sendLocalNotification(attrs);
  } 
  
  if (notificationType.includes(NotificationType.sns)) {
    await sendSnsNotification(attrs);
  }
}

/**
 * 
 * @param attrs 
 */
export async function sendSnsNotification(
  attrs: NotificationAttributes
): Promise<PublishBatchCommandOutput> {
  
  const response = await snsClient.publish({
    TopicArn: config.notificationSnsTopicArn,
    Message: `${attrs.title} - ${attrs.message} - ${attrs.url}`,
    MessageAttributes: {
      retailer: {
        DataType: 'String',
        StringValue: attrs.retailer,
      }
    }
  });

  console.log(`SNS response: ${JSON.stringify(response)}`);

  return response;
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
