import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { launchTestBrowser } from './test-utils';
import { Browser } from 'puppeteer';
import { isInStock } from '../src/walmart-scraper';
import { Retailers } from '../src/types';

puppeteer.use(StealthPlugin());

describe('walmart-scraper', () => {
  describe('isInStock', () => {
    let browser: Browser;
    
    beforeAll(async () => {
      browser = await launchTestBrowser({ headless: false });
    });

    afterAll(async () => {
      await browser.close();
    });

    test('it should return false for an out of stock item', async () => {
      const result = await isInStock(
        browser,
        { 
          retailer: Retailers.walmart,
          url: 'https://www.walmart.com/ip/seot/14169661774',
          id: '14169661774',
        },
      );

      expect(result).toBe(false);
    });

    test('it should return true for an in stock item shipped and sold by Walmart', async () => {
      const result = await isInStock(
        browser,
        {
          retailer: Retailers.walmart,
          url: 'https://www.walmart.com/ip/Bounty-Full-Sheet-Paper-Towels-6-Mega-Rolls-White/1543757567',
          id: '1543757567'
        },
      );

      expect(result).toBe(true);
    });

    test('it should return false for an in stock item not shipped and sold by Walmart', async () => {
      const result = await isInStock(
        browser,
        {
          retailer: Retailers.walmart,
          url: 'https://www.walmart.com/ip/seot/14148473268?listRegistryId=237b28bf-0f6c-422c-a92d-57785d6744',
          id: '14148473268'
        }
      );

      expect(result).toBe(false);
    });
  });
});
