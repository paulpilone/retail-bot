import commandLineArgs from 'command-line-args';
import colors from 'colors';
import notifier from 'node-notifier';
import pMap from 'p-map';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { isInStock } from './target-bot.js';
import { TargetItem } from './types.js';
import { randomUserAgent } from './browser-utils.js';

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

// TODO: Read this from a file instead.
const targetItems: TargetItem[] = [
  {
    // PE Surprise Box
    title: 'PE Surprise Box',
    url: 'https://www.target.com/p/2025-pokemon-scarlet-violet-s8-5-prismatic-evolutions-surprise-box/-/A-94336414',
    id: '94336414',
  },
  {
    // PE ETB
    title: 'PE ETB',
    url: 'https://www.target.com/p/2024-pok-scarlet-violet-s8-5-elite-trainer-box/-/A-93954435',
    id: '93954435',
  },
  {
    // PE Binder Collection
    title: 'PE Binder Collection',
    url: 'https://www.target.com/p/2025-pokemon-prismatic-evolutions-binder-collection/-/A-94300066',
    id: '94300066',
  },
  {
    // PE Booster Bundle
    title: 'PE Booster Bundle',
    url: 'https://www.target.com/p/pok-233-mon-trading-card-game-scarlet-38-violet-prismatic-evolutions-booster-bundle/-/A-93954446',
    id: '93954446',
  },
  {
    // PE Tins
    title: 'PE Mini Tins',
    url: 'https://www.target.com/p/pokemon-tcg-scarlet-violet-prismatic-evolutions-mini-tin-display-8ct-display/-/A-1001559212',
    id: '1001559212',
  },
  {
    // 151 Booster Bundle
    title: '151 Booster Bundle',
    url: 'https://www.target.com/p/pokemon-scarlet-violet-s3-5-booster-bundle-box/-/A-88897904',
    id: '88897904',
  },
];

interface NotificationAttributes {
  title: string,
  message: string,
  url: string
}

/**
 * 
 * @param attrs 
 */
function notify(attrs: NotificationAttributes) {
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
