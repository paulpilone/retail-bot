import commandLineArgs from 'command-line-args';
import colors from 'colors';
import notifier from 'node-notifier';
import pMap from 'p-map';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock as isInStockTarget } from './target-scraper.js';
import { isInStock as isInStockBestBuy } from './best-buy-scraper.js';
import { randomUserAgent } from './browser-utils.js';
import  { items } from './items.js';
import {
  Item,
  Listing,
  LocalNotificationAttributes,
  Retailers
} from './types.js';

const optionDefinitions = [
  { name: 'notify', alias: 'n', type: Boolean, defaultOption: false },
];
const options = commandLineArgs(optionDefinitions);

const minScrapeDelay = 6000;
const maxScrapeDelay = 12000;

// Initial testing suggests puppeteer only processes the focused tab in a browser -- so
// parallelizing items or listings with pMap doesn't improve performance. Changing these
// values won't do much.
const ITEM_CONCURRENCY = 1;
const LISTING_CONCURRENCY = 1;

// Configure Puppeteer to be stealthy
// @ts-expect-error There are some weird import things going on with puppeteer extra and ESM
puppeteer.use(StealthPlugin())

/**
 *
 * @param attrs
 */
function sendInStockNotification(attrs: LocalNotificationAttributes) {
  notifier.notify({
    title: `${attrs.title}`,
    message: attrs.message,
    open: attrs.url,
    sound: true,
    timeout: 30
  });
}

async function checkItemsInStock(browser: Browser, items: Item[]) {
  await pMap(
    items,
    async (item: Item) => {
      await pMap(
        item.listings,
        async(listing: Listing) => {
          try {
            console.log(`Checking ${item.title} at ${listing.retailer}...\n`);
            let isInStock = false;
            if (listing.retailer.toLowerCase() === Retailers.target.toLocaleLowerCase())
              isInStock = await isInStockTarget(browser, listing);
            else if (listing.retailer.toLowerCase() === Retailers.bestBuy.toLowerCase()) {
              isInStock = await isInStockBestBuy(browser, listing);
            }

            if (isInStock) {
              const message = `\nHurry! ${item.title} is in stock at ${listing.retailer}!\n`;
              console.log(colors.green(message));

              if (options.notify) {
                sendInStockNotification({ title: item.title, message, ...listing });
              }
            } else {
              console.log(colors.red(`\nNo rush. ${item.title} is still out of stock at ${listing.retailer}.\n`));
            }

          } catch (error) {
            console.log(`Got an error checking availability: ${error}\n`);
          }
        },
        { concurrency: LISTING_CONCURRENCY }
      )
    },
    { concurrency: ITEM_CONCURRENCY }
  );
}

// FIXME: There's some try/catch brokenness in here.
// Browser open/close is outside the try/catch. If a page throws an error we close the browser and bail?
// We should be catching errors from page loads and if it's really bad close the browser and start over.
async function main() {
  while (true) {
    // @ts-expect-error There are some weird import things going on with puppeteer extra and ESM
    const browser: Browser = await puppeteer.launch({
      headless: true,
      args: [
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        '--window-size=1920,1080',
        `--user-agent=${randomUserAgent()}`,
      ],
      defaultViewport: null,
    });

    try {
      await checkItemsInStock(browser, items);

      const scrapeDelay = Math.floor(Math.random() * (maxScrapeDelay - minScrapeDelay + 1)) + minScrapeDelay;
      console.log(`Going to sleep for ${scrapeDelay}...\n`);
      await new Promise((resolve) => setTimeout(resolve, scrapeDelay));
    } catch (err) {
      console.log(`Got an error: ${err}`);
    } finally {
      await browser.close();
    }
  }
};


main();
