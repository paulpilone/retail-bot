import { Browser } from 'puppeteer';
import { Item } from './types.js';

import { waitForHTMLRendered } from './browser-utils.js';

export async function isInStock(browser: Browser, item: Item): Promise<boolean> {
  const page = await browser.newPage();
  // page.setUserAgent(randomUserAgent());

  try {
      await page.goto(item.url, { waitUntil: 'networkidle0' });
      await waitForHTMLRendered(page);
      
      // TODO: Improve the Best Buy scraper by checking and selecting
      // the shipping button. Best Buy hides the shipping button until you
      // enter a zip code on some pages.
      
      // Check if the Add To Cart (Preorder) button is enabled.
      return await page.$eval(
          'button[class*=" add-to-cart-button"]', 
          (btn) => {
              // const addToCartButtonState = btn.getAttribute('data-button-state');
              // return addToCartButtonState !== "SOLD_OUT"
              //   && addToCartButtonState !== "COMING_SOON";
              return !btn.hasAttribute('disabled');
          }
      );     
  } catch (error) {
      // TODO: DEBUG screenshot.
      // Take a screenshot if in debug mode.
      await page.screenshot({ path: `tests/screenshots/${item.id}.png`})

      throw error;
  } finally {
      page.close();
  }
};
