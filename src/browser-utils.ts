import { Page } from "puppeteer";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Configure Puppeteer to be stealthy
// @ts-expect-error There are some weird import things going on with puppeteer extra and ESM
puppeteer.use(StealthPlugin())

export async function launchBrowser(browserOptions = {}) {
  // @ts-expect-error There are some weird import things going on with puppeteer extra and ESM
    return await puppeteer.launch({
      headless: true,
      args: [
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        '--window-size=1920,1080',
        `--user-agent=${randomUserAgent()}`,
      ],
      defaultViewport: null,
      ...browserOptions,
    });
}

/**
 * 
 * @returns 
 */
export function randomUserAgent(): string {
  // Array of random user agents
  const userAgents: string[] = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  ];

  // Get a random index based on the length of the user agents array
  const randomUAIndex = Math.floor(Math.random() * userAgents.length);

  // Return a random user agent using the index above
  return userAgents[randomUAIndex];
}

/**
 * FIXME: This was borred from the internet. Clean it up.
 * @param page
 * @param timeout
 */
export async function waitForHTMLRendered(page: Page, timeout = 30000) {
  const checkDurationMsecs = 1500;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while (checkCounts++ <= maxChecks) {
    const html = await page.content();
    const currentHTMLSize = html.length;

    // const bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
    // console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else
      countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered...");
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await new Promise(resolve => setTimeout(resolve, checkDurationMsecs));
  }
};
