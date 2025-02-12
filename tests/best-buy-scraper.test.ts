import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock } from '../src/best-buy-scraper';

puppeteer.use(StealthPlugin());

describe('best-buy-scraper', () => {
  describe('isInStock', () => {
    let browser;

    beforeAll(async () => {
      browser = await puppeteer.launch({
          headless: true,
          args: [
              `--no-sandbox`,
              `--disable-setuid-sandbox`,
              '--window-size=1920,1080',  
              '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          ],
          defaultViewport: null,
      });
    });

    afterAll(async () => {
        await browser.close();
    });

    test('it should respond true for an in stock item', async () => {
      const result = await isInStock(
          browser,
          {   
              // Test in stock item (we hope it's actually in stock)
              title: 'In Stock Item',
              url: 'https://www.bestbuy.com/site/mario-kart-8-deluxe-nintendo-switch-oled-model-nintendo-switch-nintendo-switch-lite/5723304.p?skuId=5723304',
              id: '5723304',
          },
      );

      expect(result).toBe(true);
    });

    test('it should respond false for an in stock item', async () => {
      const result = await isInStock(
          browser,
          {   
              // Test in stock item (we hope it's actually out of stock)
              title: 'Out of Stock Item',
              url: 'https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-binder-collection/6606079.p?skuId=6606079',
              id: '6606079',
          },
      );

      expect(result).toBe(false);
    });

    test('it should respond false for an out of stock preorder item', async () => {
      const result = await isInStock(
          browser,
          {
              title: 'Preorder Unavailable',
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
              title: 'Preorder Available',
              url: 'https://www.bestbuy.com/site/metal-gear-solid--snake-eater-tactical-edition-playstation-5/6586815.p?skuId=6586815',
              id: '6586815',
          },
      );

      expect(result).toBe(true);
    });
  });
});
