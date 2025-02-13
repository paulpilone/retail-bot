import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

/**
 *
 * @param browserOptions
 * @returns
 */
export async function launchTestBrowser(browserOptions = {}) {
  return await puppeteer.launch({
    headless: true,
    args: [
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    ],
    defaultViewport: null,
    ...browserOptions,
  });
}
