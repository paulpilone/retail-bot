import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';

import { sendSnsNotification } from '../src/notifier';
import { Retailers } from '../src/types';

const snsClientMock = mockClient(SNSClient);

import config from './config';

describe('notifier', () => {
  describe('sendSnsNotification', () => {

    beforeEach(() => {
      snsClientMock.reset();
    });
    
    test('it should publish an SNS message', async () => {
      snsClientMock
      .on(PublishCommand, {
        TopicArn: config.notificationSnsTopicArn,
        Message: 'Test notification - This is a test notification - www.google.com',
        MessageAttributes: {
          retailer: {
            DataType: 'String',
            StringValue: Retailers.target
          }
        } 
      })
      .resolves({
        '$metadata': {
            httpStatusCode: 200,
            requestId: 'abc123',
            extendedRequestId: undefined,
            cfId: undefined,
            attempts: 1,
            totalRetryDelay: 0
        },
        MessageId: 'abc123'
      });

      const response = await sendSnsNotification({
        title: 'Test notification',
        message: 'This is a test notification',
        url: 'www.google.com',
        retailer: Retailers.target,
      });

      expect(response['MessageId']).toEqual('abc123');
    });

  })
});
