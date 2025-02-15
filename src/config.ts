import dotenv from 'dotenv';
dotenv.config();

export default {
  notificationSnsTopicArn: process.env.NOTIFICATION_SNS_TOPIC_ARN
}
