import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock } from '../src/best-buy-scraper';
import { Retailers } from '../src/types';
import { launchTestBrowser } from './test-utils';

puppeteer.use(StealthPlugin());

describe('best-buy-scraper', () => {
  describe('isInStock', () => {
    let browser;

    beforeAll(async () => {
      browser = await launchTestBrowser();
    });

    afterAll(async () => {
        await browser.close();
    });

    test('it should respond true for an in stock item', async () => {
      const result = await isInStock(
          browser,
          {
              // Test in stock item (we hope it's actually in stock)
              // title: 'In Stock Item',
              retailer: Retailers.bestBuy,
              url: 'https://www.bestbuy.com/site/mario-kart-8-deluxe-nintendo-switch-oled-model-nintendo-switch-nintendo-switch-lite/5723304.p?skuId=5723304',
              id: '5723304',
          },
      );

      expect(result).toBe(true);
    });

    test('it should respond false for an out of stock item', async () => {
      const result = await isInStock(
          browser,
          {
              // Test out stock item (we hope it's actually out of stock)
              // title: 'Out of Stock Item',
              retailer: Retailers.bestBuy,
              url: 'https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-surprise-box/6607717.p?skuId=6607717',
              id: '6607717',
          },
      );

      expect(result).toBe(false);
    });

    test('it should respond false for an out of stock preorder item', async () => {
      const result = await isInStock(
          browser,
          {
              // title: 'Preorder Unavailable',
              retailer: Retailers.bestBuy,
              url: 'https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-accessory-pouch-special-collection/6609202.p?skuId=6609202',
              id: '6609202'
          }
      );

      expect(result).toBe(false);
    });

    test('it should respond true for an in stock preorder item', async () => {
      const result = await isInStock(
          browser,
          {
              // title: 'Preorder Available',
              retailer: Retailers.bestBuy,
              url: 'https://www.bestbuy.com/site/metal-gear-solid--snake-eater-tactical-edition-playstation-5/6586815.p?skuId=6586815',
              id: '6586815',
          },
      );

      expect(result).toBe(true);
    });
  });
});
