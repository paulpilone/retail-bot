import commandLineArgs from 'command-line-args';
import colors from 'colors';
import pMap from 'p-map';
import { Browser } from 'puppeteer';

import { isInStock as isInStockBestBuy } from './best-buy-scraper.js';
import { isInStock as isInStockTarget } from './target-scraper.js';
import { items } from './items.js';
import { launchBrowser } from './browser-utils.js';
import { sendNotification } from './notifier.js'
import {
  Item,
  Listing,
  Retailers
} from './types.js';

const optionDefinitions = [
  { name: 'notificationType', alias: 'n', multiple: true, type: String },
  { name: 'retailer', alias: 'r', type: String }
];
const options = commandLineArgs(optionDefinitions);
console.log(`options: ${JSON.stringify(options)}`);

const minScrapeDelay = 1000;
const maxScrapeDelay = 3000;

// Initial testing suggests puppeteer only processes the focused tab in a browser -- so
// parallelizing items or listings with pMap doesn't improve performance. Changing these
// values won't do much.
const ITEM_CONCURRENCY = 1;
const LISTING_CONCURRENCY = 1;

/**
 * 
 * @param browser 
 * @param items 
 */
async function checkItemsInStock(browser: Browser, items: Item[]) {
  await pMap(
    items,
    async (item: Item) => {
      const filteredListings = options.retailer
       ? item.listings.filter((listing) => options.retailer === listing.retailer)
       : item.listings;

      await pMap(
        filteredListings,
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

              if (options.notificationType) {
                await sendNotification(
                  options.notificationType, 
                  { title: item.title, message, ...listing }
                );
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
    const browser = await launchBrowser();

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
