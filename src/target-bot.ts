import { Browser, Page } from "puppeteer";

import { TargetItem } from './types.js';

// FIXME: This code was borrowed from the internet. It works but let's clean it up.
const waitTillHTMLRendered = async (page: Page, timeout = 30000) => {
    const checkDurationMsecs = 2000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
  
    while(checkCounts++ <= maxChecks){
      const html = await page.content();
      const currentHTMLSize = html.length; 
  
      const bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
  
      console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
  
      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; //reset the counter
  
      if(countStableSizeIterations >= minStableSizeIterations) {
        console.log("Page rendered fully..");
        break;
      }
  
      lastHTMLSize = currentHTMLSize;
      await new Promise(resolve => setTimeout(
            resolve, 
            checkDurationMsecs,
        ));
    }  
  };

/**
 * Checks if an item is in stock at Target.
 *
 * @param itemUrl - The Target URL of the item.
 * @returns {Promise<boolean>} - True if the item is in stock, false otherwise.
 */
export async function isInStock(browser: Browser, item: TargetItem): Promise<boolean> {
    const page = await browser.newPage();
    // page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    
    // await page.setRequestInterception(true);
    // page.on('request', request => {
    //   if (request.resourceType() === 'image') {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    try {
        await page.goto(item.url, { waitUntil: 'networkidle0' });
        await waitTillHTMLRendered(page);
        
        try {
            const shipButton = await page.waitForSelector(
                'button[data-test="fulfillment-cell-shipping"]', 
                { visible: true, timeout: 5000 }
            );
            await shipButton?.click();
        } catch {
            // Couldn't find the Ship button. Happens if this is a preorder page.
            console.log("Couldn't find the Ship button... maybe it's a preorder?");
        }
        
        // Check if the Add To Cart (Preorder) button is enabled.
        return await page.$eval(
            'button[id^="addToCartButtonOrTextIdFor"], button[id*=" addToCartButtonOrTextIdFor"]', 
            (btn) => {
                return !btn.hasAttribute('disabled');
            }
        );     
    } catch (error) {
        // Take a screenshot if in debug mode.
        await page.screenshot({ path: `tests/screenshots/${item.id}.png`})

        throw error;
    } finally {
        page.close();
    }
}
