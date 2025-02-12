import commandLineArgs from 'command-line-args';
import colors from 'colors';
import notifier from 'node-notifier';
import pMap from 'p-map';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock as isInStockTarget } from './target-bot.js';
import { isInStock as isInStockBestBuy } from './target-bot.js';
import { randomUserAgent } from './browser-utils.js';
import  { items } from './items.js';
import { LocalNotificationAttributes } from './types.js';

const optionDefinitions = [
  { name: 'notify', alias: 'n', type: Boolean, defaultOption: false },
];
const options = commandLineArgs(optionDefinitions);

const minScrapeDelay = 6000;
const maxScrapeDelay = 12000;

const browserConcurrency = 1;

// Configure Puppeteer to be stealthy
// @ts-expect-error There are some weird import things going on with puppeteer extra and ESM
puppeteer.use(StealthPlugin())

/**
 * 
 * @param attrs 
 */
function notify(attrs: LocalNotificationAttributes) {
  notifier.notify({
    title: `${attrs.title}`,
    message: attrs.message,
    open: attrs.url,
    sound: true,
    timeout: 30
  });
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
      await pMap(
        targetItems,
        async (item: TargetItem) => {
          try {
            console.log(`Checking ${item.title} at Target...\n`);
            const isInStockTarget = await isInStock(browser, item);
            
            if (isInStockTarget) {
              const message = `\nHurry! ${item.title} is in stock at Target!\n`;
              console.log(colors.green(message));
            
              if (options.notify) {
                notify({ ...item, message });
              }
            } else {
              console.log(colors.red(`\nNo rush. ${item.title} is still out of stock.\n`));
            }

          } catch (error) {
            console.log(`Got an error checking availability: ${error}\n`);
          }
        },
        { concurrency: browserConcurrency }
      );

      // DEBUG Let's make sure our number of pages doesn't leak
      console.log(`Number of browser pages: ${(await browser.pages()).length}`);

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
