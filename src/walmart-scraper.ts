import { Browser } from 'puppeteer';
import { Listing } from './types.js';
import { randomUserAgent, waitForHTMLRendered } from './browser-utils.js';

export async function isInStock(browser: Browser, listing: Listing) {
  const page = await browser.newPage();
  page.setUserAgent(randomUserAgent());

  // Randomize viewport size
  // await page.setViewport({
  //   width: 1920 + Math.floor(Math.random() * 100),
  //   height: 3000 + Math.floor(Math.random() * 100),
  //   deviceScaleFactor: 1,
  //   hasTouch: false,
  //   isLandscape: false,
  //   isMobile: false,
  // });

  // // await page.setUserAgent(UA);
  await page.setJavaScriptEnabled(true);
  await page.setDefaultNavigationTimeout(0);

  // //Skip images/styles/fonts loading for performance
  // await page.setRequestInterception(true);
  // page.on('request', (req) => {
  //     if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
  //         req.abort();
  //     } else {
  //         req.continue();
  //     }
  // });

  await page.evaluateOnNewDocument(() => {
    // Pass webdriver check
    Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Pass chrome check
    // @ts-expect-error Testing out additional bot checks
    window.chrome = {
        runtime: {},
        // etc.
    };
  });

  await page.evaluateOnNewDocument(() => {
    // Pass notifications check
    const originalQuery = window.navigator.permissions.query;
    return window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ ...originalQuery(parameters), state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  await page.evaluateOnNewDocument(() => {
      // Overwrite the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'plugins', {
          // This just needs to have `length > 0` for the current test,
          // but we could mock the plugins too if necessary.
          get: () => [1, 2, 3, 4, 5],
      });
  });

  await page.evaluateOnNewDocument(() => {
      // Overwrite the `languages` property to use a custom getter.
      Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
      });
  });

  try {
    await page.goto('https://walmart.com', { waitUntil: 'domcontentloaded' });
    await waitForHTMLRendered(page);

    await page.screenshot({ path: 'tests/screenshots/walmart.png' });

    // Move mouse.
    await page.mouse.move(
      Math.floor(Math.random() * 1920),
      Math.floor(Math.random() * 1080),
    );

    // Move mouse.
    await page.mouse.move(
      Math.floor(Math.random() * 1920),
      Math.floor(Math.random() * 1080),
    );

    await page.goto(listing.url, { waitUntil: 'domcontentloaded' });
    await waitForHTMLRendered(page);

    // Take a screenshot so we get one every test.
    await page.screenshot({ path: `tests/screenshots/${listing.id}.png` });
    
    try {
      const reCaptchaEl = await page.waitForSelector('h1[class*=" sign-in-widget"', { timeout: 5000 });
      if (reCaptchaEl) {
        console.log('Got a captcha');
      }  

      const reCaptchaBoundingBox = await reCaptchaEl?.boundingBox();
      
      if (reCaptchaBoundingBox) {
        console.log(`reCaptcha title bounding box is ${JSON.stringify(reCaptchaBoundingBox)}`);
        const x = reCaptchaBoundingBox.x + (reCaptchaBoundingBox.width / 2);
        const y = reCaptchaBoundingBox.y + reCaptchaBoundingBox.height + 100;
        console.log(`Going to try and tap and hold recaptcha at: ${x}, ${y}`);

        await page.mouse.move(
          890, 
          250
        );
        await page.mouse.down();
        // hold down for six seconds
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    } catch {
      console.log('Timed out looking for a full page captcha.');
    }

    // await page.mouse.move(
    //   600, 
    //   550
    // );
    // await page.mouse.down();
    // // hold down for six seconds
    // await new Promise((resolve) => setTimeout(resolve, 6000));
    
    // <h1 class="heading heading-d sign-in-widget" title="X is 577 and Y is 112">
    //             Robot or human?
    //         </h1>

    // await page.setRequestInterception(true);
    // page.on('request', request => {
    //   if (request.resourceType() === 'image') {
    //       request.abort();
    //   } else {
    //       request.continue();
    //   }
    // });
    // //*[@id="maincontent"]/section/main/div[2]/div[2]/div/div[3]/div/div[1]/div/div/div[5]/div[1]/div/div/div/div[2]/div/div

    const addToCartSection = await page.waitForSelector('div[data-testid="add-to-cart-section"]', { timeout: 5000 });
    if (!addToCartSection) {
      return false;
    }

    const addToCartSectionHTML = await page.evaluate(el => el.outerHTML, addToCartSection);
    console.log(addToCartSectionHTML);    
    const divs = await addToCartSection.$$('div');

    for (const div of divs) {
      const text = await page.evaluate(el => el.textContent?.trim(), div);
      if (text === 'Out of stock') {
        console.log("Found the element:", await page.evaluate(el => el.outerHTML, div));
        return false;
      }
    }

    // Going to assume we have an in stock item. Verify it's sold and shipped by Walmart.
    const soldAndShippedByModule = await page.waitForSelector('div[data-testid="ip-sold-and-shipped-by-module"]', { timeout: 5000 });
    if (!soldAndShippedByModule) {
      return false;
    }

    const soldAndShippedByModuleHTML = await page.evaluate(el => el.outerHTML, soldAndShippedByModule);
    console.log(soldAndShippedByModuleHTML);    
    
    const soldAndShippedByWalmartSpans = await soldAndShippedByModule.$$('span[aria-label="Sold and shipped by Walmart.com"]');
    return soldAndShippedByWalmartSpans.length > 0;

    // throw new Error();
  } catch (error) {
      await page.screenshot({ path: `tests/screenshots/${listing.id}.png`})

      throw error;
  } finally {
    await page.close();
  }
};
