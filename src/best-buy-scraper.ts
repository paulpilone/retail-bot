import { Browser } from 'puppeteer';
import { Listing } from './types.js';

import { waitForHTMLRendered } from './browser-utils.js';

export async function isInStock(browser: Browser, listing: Listing): Promise<boolean> {
  const page = await browser.newPage();
  // page.setUserAgent(randomUserAgent());

  try {
      await page.goto(listing.url, { waitUntil: 'domcontentloaded' });
      await waitForHTMLRendered(page);

      // await page.setRequestInterception(true);
      // page.on('request', request => {
      //   if (request.resourceType() === 'image') {
      //       request.abort();
      //   } else {
      //       request.continue();
      //   }
      // });

      // TODO: Improve the Best Buy scraper by checking and selecting
      // the shipping button. Best Buy hides the shipping button until you
      // enter a zip code on some pages.

      // Check if the Add To Cart (Preorder) button is enabled.
      return await page.$eval(
          'button[class*=" add-to-cart-button "]',
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
      await page.screenshot({ path: `tests/screenshots/${listing.id}.png`})

      throw error;
  } finally {
      page.close();
  }
};
