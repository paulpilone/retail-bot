import { sendSnsNotification } from '../src/notifier';
import { Retailers } from '../src/types';

describe('notifier', () => {
  describe('sendSnsNotification', () => {
    test.skip('it should publish an SNS message', async () => {
      await sendSnsNotification({
        title: 'Test notification',
        message: 'This is a test notification',
        url: 'www.google.com',
        retailer: Retailers.target,
      })

      expect(true);
    });
  })
});
