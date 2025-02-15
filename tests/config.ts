import dotenv from 'dotenv';
dotenv.config({ path: '../.env.test'});

export default {
  notificationSnsTopicArn: process.env.NOTIFICATION_SNS_TOPIC_ARN
}
